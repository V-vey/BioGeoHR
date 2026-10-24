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

// today in the school's timezone, as YYYY-MM-DD (toISOString is UTC: before 8 AM it gives yesterday)
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());

// the time now in the school's timezone, as HH:MM (24-hour, like the time boxes)
const nowTime = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());

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

const blankRecord = {
  // On-Time or Late is not chosen: the server works it out from the clock-in (see lateCheck)
  status: "Present",
  location_id: "",
  time_in: "",
  time_out: "",
  remarks: "",
};

export default function CreateAttendanceModal({ onSaved, onClose }) {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    user_id: "",
    date: today(),
    ...blankRecord,
  });
  // the record the employee already has on that day (e.g. clocked in on the phone), or null
  const [existing, setExisting] = useState(null);
  const existingRef = useRef(null);
  // for the On-Time / Late preview
  const [graceMinutes, setGraceMinutes] = useState(15);

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

  // when the employee already has a record on the chosen day, start the form from it
  useEffect(() => {
    if (!form.user_id || !form.date) return;
    let cancelled = false;
    const lookup = async () => {
      try {
        const res = await axios.get(url + "/attendance/forDay", {
          headers: headers(),
          params: { user_id: form.user_id, date: form.date },
        });
        if (cancelled) return;
        const record = res.data.attendance;
        if (record) {
          setForm((f) => ({
            ...f,
            status: record.status === "Absent" ? "Absent" : "Present",
            location_id: record.location_id ?? "",
            time_in: record.time_in ?? "",
            time_out: record.time_out ?? "",
            remarks: record.remarks ?? "",
          }));
        } else if (existingRef.current) {
          // the fields came from another day or employee: clear them
          setForm((f) => ({ ...f, ...blankRecord }));
        }
        existingRef.current = record;
        setExisting(record);
      } catch (error) {
        console.error("Failed to load the existing attendance:", error);
      }
    };
    lookup();
    return () => {
      cancelled = true;
    };
  }, [form.user_id, form.date]);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const absent = form.status === "Absent";
  // on today's date the clock-in and clock-out cannot be later than now
  const latestTime = form.date === today() ? nowTime() : undefined;

  // On-Time or Late, by the same rule the server uses (store in AttendanceController): late when the
  // clock-in is after the employee's start time plus the grace period
  const lateCheck = (() => {
    const employee = users.find((u) => String(u.id) === String(form.user_id));
    if (absent || !employee || !form.time_in || !form.date) return null;
    if (!employee.call_time) return { status: "On-Time", reason: "no start time on the profile" };
    const deadline = toMinutes(employee.call_time) + graceMinutes;
    return {
      status: toMinutes(form.time_in) <= deadline ? "On-Time" : "Late",
      reason: `starts at ${formatMinutes(toMinutes(employee.call_time))}, late after ${formatMinutes(deadline)}`,
    };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!absent && form.date === today()) {
      // checked again here: the box's limit was set when the form was drawn, and time has moved on
      const now = nowTime();
      if (form.time_in > now || (form.time_out && form.time_out > now)) {
        notifyError(
          `The clock-in and clock-out cannot be later than the time now (${now}).`,
          "Could not save",
        );
        return;
      }
    }
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
                  max={latestTime}
                  value={form.time_in}
                  onChange={update("time_in")}
                  className={fieldClass}
                />
              </label>
              <label className="flex-1 text-left text-sm font-medium">
                Clock out
                <input
                  type="time"
                  max={latestTime}
                  value={form.time_out}
                  onChange={update("time_out")}
                  className={fieldClass}
                />
              </label>
            </div>
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

        <p className="text-xs text-[#8a90a3] text-left">
          {existing
            ? existing.time_in && !existing.time_out
              ? `Clocked in at ${existing.time_in} and not clocked out yet. Saving replaces this record.`
              : "This employee already has a record for that day. Saving replaces it."
            : "An existing record for that day will be replaced."}
        </p>

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
            className="px-4 py-1 rounded-full text-white bg-[#2AAF56] hover:bg-[#2AAF56]/80"
          >
            Save attendance
          </button>
        </div>
      </form>
    </div>
  );
}
