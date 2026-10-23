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

const blankRecord = {
  status: "On-Time",
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
            status: record.status,
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
