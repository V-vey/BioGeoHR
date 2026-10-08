import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "ngrok-skip-browser-warning": "true",
});

// "08:00:00" -> minutes since midnight (480), or null when missing
const toMinutes = (t) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t ?? ""));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

// 480 -> "8:00 AM"
const toClock = (minutes) => {
  if (minutes == null) return "--";
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m % 60).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
};

// the first validation message the server sent, or its general message
const errorText = (error, fallback) => {
  const errors = error.response?.data?.errors;
  if (errors) return Object.values(errors)[0][0];
  return error.response?.data?.message || fallback;
};

export default function WorkingHoursOutlet() {
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  // the two form fields are text while typing and checked on Save
  const [grace, setGrace] = useState("");
  const [interval, setIntervalMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { ok: boolean, text: string }

  const applySettings = (s) => {
    setSettings(s);
    setGrace(String(s.late_grace_period_minutes));
    setIntervalMinutes(String(s.geofence_check_interval_minutes));
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [settingsRes, usersRes, salaryRes] = await Promise.all([
          axios.get(url + "/systemSettings", { headers: headers() }),
          axios.get(url + "/users", { headers: headers() }),
          axios.get(url + "/salary", { headers: headers() }),
        ]);
        if (cancelled) return;
        applySettings(settingsRes.data);
        setUsers(usersRes.data);
        setSalaries(salaryRes.data);
      } catch (error) {
        console.error("Failed to load working hours:", error);
        if (!cancelled)
          setMessage({ ok: false, text: "Could not load the settings." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);

    // check here first, so a simple mistake does not need a round trip
    const g = Number(grace);
    const i = Number(interval);
    if (grace === "" || !Number.isInteger(g) || g < 0 || g > 120) {
      setMessage({ ok: false, text: "Grace period must be 0 to 120 minutes." });
      return;
    }
    if (interval === "" || !Number.isInteger(i) || i < 15 || i > 120) {
      setMessage({
        ok: false,
        text: "Location check interval must be 15 to 120 minutes.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put(
        `${url}/systemSettings/${settings.id}`,
        { late_grace_period_minutes: g, geofence_check_interval_minutes: i },
        { headers: headers() },
      );
      applySettings({ ...settings, ...res.data });
      setMessage({ ok: true, text: "Saved." });
    } catch (error) {
      setMessage({ ok: false, text: errorText(error, "Could not save.") });
    } finally {
      setSaving(false);
    }
  };

  // one row per active employee: start time (from the profile) + hours a day (from the salary)
  const schedule = useMemo(() => {
    const hoursByUser = new Map(
      salaries.map((s) => [s.user_id, Number(s.working_hours_per_day)]),
    );
    return users
      .filter((u) => u.is_active !== 0 && u.is_active !== false)
      .map((u) => {
        const start = toMinutes(u.call_time);
        const hours = hoursByUser.get(u.id);
        const end =
          start != null && Number.isFinite(hours) ? start + hours * 60 : null;
        return {
          id: u.id,
          name: u.name,
          department: u.department,
          start: toClock(start),
          hours: Number.isFinite(hours) ? hours : null,
          end: toClock(end),
        };
      })
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [users, salaries]);

  const inputClass =
    "w-40 border border-[#b2b2b2] rounded-[10px] p-2 text-center";

  return (
    <>
      {loading && <Loading />}
      <div className="flex flex-col gap-4">
        <div className=" flex justify-end p-4 md:p-[16px_20px]  bg-white border border-[#b2b2b2] rounded-[14px]">
          <h2 className="text-[#6675EC] font-bold justify-end">
            Working Hours
          </h2>
        </div>

        <div className="bg-white border border-[#b2b2b2] rounded-[10px] w-full">
          <div className="text-start px-4 py-2">
            <p className="font-medium">Attendance rules</p>
          </div>
          <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5" />

          <form onSubmit={handleSave} className="flex flex-col gap-4 px-4 py-4">
            <div className="flex flex-col items-start gap-1">
              <label htmlFor="grace" className="font-medium pl-2">
                Late grace period (minutes)
              </label>
              <input
                id="grace"
                type="number"
                min="0"
                max="120"
                value={grace}
                onChange={(e) => setGrace(e.target.value)}
                className={inputClass}
              />
              <p className="text-sm text-[#8a90a3] pl-2 text-start">
                A clock-in up to this many minutes after an employee&apos;s
                start time still counts as On-Time.
              </p>
            </div>

            <div className="flex flex-col items-start gap-1">
              <label htmlFor="interval" className="font-medium pl-2">
                Location check interval (minutes)
              </label>
              <input
                id="interval"
                type="number"
                min="15"
                max="120"
                value={interval}
                onChange={(e) => setIntervalMinutes(e.target.value)}
                className={inputClass}
              />
              <p className="text-sm text-[#8a90a3] pl-2 text-start">
                How often the phone re-checks that a clocked-in employee is
                still inside the geofence (15 to 120; Android does not run the
                check more often than every 15 minutes).
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving || !settings}
                className="px-6 py-2 rounded-full bg-[#2AAF56] hover:bg-[#6675EC] disabled:opacity-60 text-white font-medium"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              {message && (
                <p
                  role="status"
                  className={message.ok ? "text-[#2AAF56]" : "text-red-500"}
                >
                  {message.text}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white border border-[#b2b2b2] rounded-[10px] w-full overflow-hidden">
          <div className="text-start px-4 py-2">
            <p className="font-medium">Employee schedules</p>
            <p className="text-sm text-[#8a90a3]">
              The start time is set in each employee&apos;s profile. The end
              time is the start time plus their working hours per day.
            </p>
          </div>
          <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5" />
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#b2b2b2] text-sm text-[#8a90a3]">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Department</th>
                  <th className="px-4 py-2 font-medium">Starts</th>
                  <th className="px-4 py-2 font-medium">Hours / day</th>
                  <th className="px-4 py-2 font-medium">Ends</th>
                </tr>
              </thead>
              <tbody>
                {schedule.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-[#8a90a3]"
                    >
                      No employees yet.
                    </td>
                  </tr>
                )}
                {schedule.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[#b2b2b2] first:border-t-0"
                  >
                    <td className="px-4 py-2">{r.name}</td>
                    <td className="px-4 py-2">{r.department}</td>
                    <td className="px-4 py-2">{r.start}</td>
                    <td className="px-4 py-2">{r.hours ?? "--"}</td>
                    <td className="px-4 py-2">{r.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
