import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";
import { notifyError } from "@/lib/dialog";
import DateInput from "@/components/DateInput";

const fieldClass = "w-full border border-[#b2b2b2] rounded-[10px] p-2 bg-white";
const headers = () => ({
  "ngrok-skip-browser-warning": "true",
});

// today on this computer's clock (toISOString would give the UTC date, which is still yesterday early in the
// morning in Manila)
const today = () => new Date().toLocaleDateString("en-CA");

// the time now on this computer's clock, as HH:MM (24-hour, like the time boxes)
const nowTime = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

// "HH:MM" or "HH:MM:SS" -> minutes since midnight
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// minutes since midnight -> "8:15 AM"
const formatMinutes = (minutes) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = String(minutes % 60).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h < 12 ? "AM" : "PM"}`;
};

export default function CreateAttendanceModal({ onSaved, onClose }) {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [graceMinutes, setGraceMinutes] = useState(15); // for the On-Time / Late preview
  // what the chosen employee already has on the chosen day: null until both are chosen, then { found, ... }
  const [existing, setExisting] = useState(null);
  const prefilled = useRef(false); // the fields were filled in from a record, not typed
  const [form, setForm] = useState({
    user_id: "",
    date: today(),
    status: "Present", // On-Time or Late is worked out from the clock-in (see lateCheck)
    location_id: "",
    time_in: "",
    time_out: "",
    remarks: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [u, l, s] = await Promise.all([
          axios.get(url + "/users", { headers: headers() }),
          axios.get(url + "/location", { headers: headers() }),
          axios.get(url + "/systemSettings", { headers: headers() }),
        ]);
        setUsers(u.data);
        setLocations(l.data);
        setGraceMinutes(s.data?.late_grace_period_minutes ?? 15);
      } catch (error) {
        console.error("Failed to load form data:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // when an employee and a day are chosen, start from the record that employee already has on that day
  // (clock in, clock out, location, status), so HR corrects it instead of typing it again
  useEffect(() => {
    if (!form.user_id || !form.date) return;
    const key = `${form.user_id}|${form.date}`;
    let cancelled = false;
    axios
      .get(url + "/attendance/lookup", {
        params: { user_id: form.user_id, date: form.date },
        headers: headers(),
      })
      .then((res) => {
        if (cancelled) return;
        setExisting({ key, ...res.data });
        if (res.data.found) {
          prefilled.current = true;
          setForm((f) => ({
            ...f,
            status: res.data.status === "Absent" ? "Absent" : "Present",
            location_id: res.data.location_id ? String(res.data.location_id) : "",
            time_in: res.data.time_in ?? "",
            time_out: res.data.time_out ?? "",
          }));
        } else if (prefilled.current) {
          // the last choice was filled in from a record: do not carry it over to a day that has none
          prefilled.current = false;
          setForm((f) => ({
            ...f,
            status: "Present",
            location_id: "",
            time_in: "",
            time_out: "",
          }));
        }
      })
      .catch(() => {
        if (!cancelled) setExisting(null);
      });
    return () => {
      cancelled = true;
    };
  }, [form.user_id, form.date]);

  // the answer only counts while it is for the employee and day that are chosen now
  const record =
    existing?.key === `${form.user_id}|${form.date}` ? existing : null;

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const absent = form.status === "Absent";

  // on today's date the clock-in and clock-out cannot be later than now: the box turns red and Save waits
  const latestTime = form.date === today() ? nowTime() : null;
  const futureIn = !!latestTime && !!form.time_in && form.time_in > latestTime;
  const futureOut = !!latestTime && !!form.time_out && form.time_out > latestTime;
  const futureTime = !absent && (futureIn || futureOut);

  // On-Time or Late, by the same rule the server uses (manualStatus in AttendanceController): late when
  // the clock-in is after the employee's start time plus the grace period
  const lateCheck = (() => {
    const employee = users.find((u) => String(u.id) === String(form.user_id));
    if (absent || !employee || !form.time_in) return null;
    if (!employee.call_time) return { status: "On-Time", reason: "no start time on the profile" };
    const deadline = toMinutes(employee.call_time) + graceMinutes;
    return {
      status: toMinutes(form.time_in) <= deadline ? "On-Time" : "Late",
      reason: `starts at ${formatMinutes(toMinutes(employee.call_time))}, late after ${formatMinutes(deadline)}`,
    };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (futureTime) return;
    setLoading(true);
    try {
      await axios.post(url + "/attendance", form, { headers: headers() });
      await onSaved?.();
      onClose();
    } catch (error) {
      const errors = error.response?.data?.errors;
      notifyError(
        errors
          ? Object.values(errors).flat().join("\n")
          : error.response?.data?.message || "Could not save the attendance.",
        "Could not save",
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
      {loading && <Loading />}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="font-bold text-left">Create attendance</h2>

        <label className="text-left text-sm font-medium">
          Employee
          <select
            required
            value={form.user_id}
            onChange={update("user_id")}
            className={fieldClass}
          >
            <option value="">Select an employee</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.department}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-row gap-2">
          <label className="flex-1 text-left text-sm font-medium">
            Date
            <DateInput
              required
              max={today()}
              value={form.date}
              onChange={update("date")}
              className={fieldClass}
            />
          </label>
          <label className="flex-1 text-left text-sm font-medium">
            Status
            <select
              value={form.status}
              onChange={update("status")}
              className={fieldClass}
            >
              <option>Present</option>
              <option>Absent</option>
            </select>
          </label>
        </div>

        {!absent && (
          <>
            <label className="text-left text-sm font-medium">
              Location
              <select
                required
                value={form.location_id}
                onChange={update("location_id")}
                className={fieldClass}
              >
                <option value="">Select a location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-row gap-2">
              <label className="flex-1 text-left text-sm font-medium">
                Clock in
                <input
                  type="time"
                  required
                  value={form.time_in}
                  onChange={update("time_in")}
                  className={`${fieldClass} ${futureIn ? "border-[#EC6668]" : ""}`}
                />
              </label>
              <label className="flex-1 text-left text-sm font-medium">
                Clock out
                <input
                  type="time"
                  value={form.time_out}
                  onChange={update("time_out")}
                  className={`${fieldClass} ${futureOut ? "border-[#EC6668]" : ""}`}
                />
              </label>
            </div>
            {futureTime && (
              <p className="text-xs text-left text-[#EC6668]">
                The clock-in and clock-out cannot be later than the time now ({latestTime}).
              </p>
            )}
            {lateCheck && (
              <p className="text-sm text-left">
                Will be saved as{" "}
                <span
                  className={`px-2 py-0.5 rounded-[6px] text-xs font-medium ${
                    lateCheck.status === "Late"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {lateCheck.status}
                </span>{" "}
                <span className="text-xs text-[#8a90a3]">({lateCheck.reason})</span>
              </p>
            )}
          </>
        )}

        <label className="text-left text-sm font-medium">
          Reason
          <input
            type="text"
            required
            maxLength={255}
            value={form.remarks}
            onChange={update("remarks")}
            className={fieldClass}
            placeholder="Fingerprint device was down"
          />
        </label>

        {record?.found ? (
          <p className="text-xs text-left rounded-[8px] bg-[#EACA3A]/15 text-[#8a6d10] px-3 py-2">
            This employee already has a record for this day
            {record.time_in ? `, clocked in at ${record.time_in}` : ""}. It is
            filled in above. Saving updates it; it does not add another.
            {record.sessions > 1
              ? ` The day has ${record.sessions} clock-in/out pairs; saving replaces them with this one.`
              : ""}
          </p>
        ) : (
          <p className="text-xs text-[#8a90a3] text-left">
            {record
              ? "No record for this day yet. Saving creates one."
              : "Pick an employee and a date to see their record for that day."}
          </p>
        )}

        <div className="flex flex-row gap-2 justify-end mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded-full text-white bg-[#EC6668] hover:bg-[#EC6668]/80"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={futureTime}
            className="px-4 py-1 rounded-full text-white bg-[#2AAF56] hover:bg-[#2AAF56]/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#2AAF56]"
          >
            Save attendance
          </button>
        </div>
      </form>
    </div>
  );
}
