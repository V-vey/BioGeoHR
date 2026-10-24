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

export default function CreateAttendanceModal({ onSaved, onClose }) {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  // what the chosen employee already has on the chosen day: null until both are chosen, then { found, ... }
  const [existing, setExisting] = useState(null);
  const prefilled = useRef(false); // the fields were filled in from a record, not typed
  const [form, setForm] = useState({
    user_id: "",
    date: today(),
    status: "On-Time",
    location_id: "",
    time_in: "",
    time_out: "",
    remarks: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [u, l] = await Promise.all([
          axios.get(url + "/users", { headers: headers() }),
          axios.get(url + "/location", { headers: headers() }),
        ]);
        setUsers(u.data);
        setLocations(l.data);
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
            status: res.data.status,
            location_id: res.data.location_id ? String(res.data.location_id) : "",
            time_in: res.data.time_in ?? "",
            time_out: res.data.time_out ?? "",
          }));
        } else if (prefilled.current) {
          // the last choice was filled in from a record: do not carry it over to a day that has none
          prefilled.current = false;
          setForm((f) => ({
            ...f,
            status: "On-Time",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
              <option>On-Time</option>
              <option>Late</option>
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
                  className={fieldClass}
                />
              </label>
              <label className="flex-1 text-left text-sm font-medium">
                Clock out
                <input
                  type="time"
                  value={form.time_out}
                  onChange={update("time_out")}
                  className={fieldClass}
                />
              </label>
            </div>
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
            className="px-4 py-1 rounded-full text-white bg-[#2AAF56] hover:bg-[#2AAF56]/80"
          >
            Save attendance
          </button>
        </div>
      </form>
    </div>
  );
}
