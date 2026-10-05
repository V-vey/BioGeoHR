import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";

const fieldClass = "w-full border border-[#b2b2b2] rounded-[10px] p-2 bg-white";
const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "ngrok-skip-browser-warning": "true",
});

export default function CreateAttendanceModal({ onSaved, onClose }) {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    user_id: "",
    date: new Date().toISOString().slice(0, 10),
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
      alert(
        errors
          ? Object.values(errors).flat().join("\n")
          : error.response?.data?.message || "Could not save the attendance.",
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
            <input
              type="date"
              required
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
          An existing record for that day will be replaced.
        </p>

        <div className="flex flex-row gap-2 justify-end mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded-full border border-[#b2b2b2]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1 rounded-full text-white bg-[#2AAF56] hover:bg-[#6675EC]"
          >
            Save attendance
          </button>
        </div>
      </form>
    </div>
  );
}
