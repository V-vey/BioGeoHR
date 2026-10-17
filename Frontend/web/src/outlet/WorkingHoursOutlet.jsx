import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";
import Containers from "@/components/container";

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
  const [loading, setLoading] = useState(true);

  // the Employee schedules table: one page at a time, searched and counted by the server
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchSent, setSearchSent] = useState("");
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsError, setRowsError] = useState(false);

  // the two form fields are text while typing and checked on Save
  const [grace, setGrace] = useState("");
  const [interval, setIntervalMinutes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [savingRule, setSavingRule] = useState(false);
  const [savingSchoolYear, setSavingSchoolYear] = useState(false);
  const [messageRule, setMessageRule] = useState(null); // { ok: boolean, text: string }
  const [messageSchoolYear, setMessageSchoolYear] = useState(null); // { ok: boolean, text: string }

  const applySettings = (s) => {
    setSettings(s);
    setGrace(String(s.late_grace_period_minutes));
    setIntervalMinutes(String(s.geofence_check_interval_minutes));
    setStartDate(s.school_year_start ?? "");
    setEndDate(s.school_year_end ?? "");
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const settingsRes = await axios.get(url + "/systemSettings", {
          headers: headers(),
        });
        if (cancelled) return;
        applySettings(settingsRes.data);
      } catch (error) {
        console.error("Failed to load working hours:", error);
        if (!cancelled)
          setMessageRule({ ok: false, text: "Could not load the settings." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // wait a moment after typing before asking the server, and go back to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchSent(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const loadRows = async () => {
      setRowsLoading(true);
      try {
        const params = { page, per_page: 10 };
        if (searchSent) params.search = searchSent;
        const res = await axios.get(url + "/systemSettings/schedules", {
          params,
          headers: headers(),
        });
        if (cancelled) return;
        setRows(res.data.data);
        setLastPage(res.data.last_page);
        setTotal(res.data.total);
        setRowsError(false);
      } catch (error) {
        console.error("Failed to load employee schedules:", error);
        if (!cancelled) setRowsError(true);
      } finally {
        if (!cancelled) setRowsLoading(false);
      }
    };
    loadRows();
    return () => {
      cancelled = true;
    };
  }, [page, searchSent]);

  const saveRule = async (payload) => {
    setMessageRule(null);
    setSavingRule(true);
    try {
      const res = await axios.put(
        `${url}/systemSettings/${settings.id}`,
        payload,
        { headers: headers() },
      );
      setSettings((cur) => ({ ...cur, ...res.data }));
      setGrace(String(res.data.late_grace_period_minutes));
      setIntervalMinutes(String(res.data.geofence_check_interval_minutes));
      setMessageRule({ ok: true, text: "Saved." });
    } catch (error) {
      setMessageRule({ ok: false, text: errorText(error, "Could not save.") });
    } finally {
      setSavingRule(false);
    }
  };

  const saveSchoolYear = async (payload) => {
    setMessageSchoolYear(null);
    setSavingSchoolYear(true);
    try {
      const res = await axios.put(
        `${url}/systemSettings/${settings.id}`,
        payload,
        { headers: headers() },
      );
      setSettings((cur) => ({ ...cur, ...res.data }));
      setStartDate(res.data.school_year_start ?? "");
      setEndDate(res.data.school_year_end ?? "");
      setMessageSchoolYear({ ok: true, text: "Saved." });
    } catch (error) {
      setMessageSchoolYear({
        ok: false,
        text: errorText(error, "Could not save."),
      });
    } finally {
      setSavingSchoolYear(false);
    }
  };

  const handleSaveRules = (e) => {
    e.preventDefault();
    setMessageRule(null);
    const g = Number(grace);
    const i = Number(interval);
    if (grace === "" || !Number.isInteger(g) || g < 0 || g > 120)
      return setMessageRule({
        ok: false,
        text: "Grace period must be 0 to 120 minutes.",
      });
    if (interval === "" || !Number.isInteger(i) || i < 15 || i > 120)
      return setMessageRule({
        ok: false,
        text: "Location check interval must be 15 to 120 minutes.",
      });
    saveRule({
      late_grace_period_minutes: g,
      geofence_check_interval_minutes: i,
    });
  };

  const handleSaveSchoolYear = (e) => {
    e.preventDefault();
    setMessageSchoolYear(null);
    if (!startDate || !endDate)
      return setMessageSchoolYear({
        ok: false,
        text: "Pick both the start and end date.",
      });
    if (endDate <= startDate)
      return setMessageSchoolYear({
        ok: false,
        text: "The end date must be after the start date.",
      });
    saveSchoolYear({ school_year_start: startDate, school_year_end: endDate }); // plain "2026-08-01" strings
  };

  // the rows of this page: start time (from the profile) + hours a day (from the salary)
  const schedule = rows.map((u) => {
    const start = toMinutes(u.call_time);
    const hours = Number(u.working_hours_per_day);
    const hasHours = u.working_hours_per_day != null && Number.isFinite(hours);
    return {
      id: u.id,
      name: u.name,
      department: u.department,
      start: toClock(start),
      hours: hasHours ? hours : null,
      end: toClock(start != null && hasHours ? start + hours * 60 : null),
    };
  });

  const goToPage = (next) => {
    if (next < 1 || next > lastPage || next === page) return;
    setPage(next);
  };

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

          <form
            onSubmit={handleSaveRules}
            className="flex flex-col gap-4 px-4 py-4"
          >
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
                disabled={savingRule || !settings}
                className="px-6 py-2 rounded-full bg-[#2AAF56] hover:bg-[#6675EC] disabled:opacity-60 text-white font-medium"
              >
                {savingRule ? "Saving..." : "Save"}
              </button>
              {messageRule && (
                <p
                  role="status"
                  className={messageRule.ok ? "text-[#2AAF56]" : "text-red-500"}
                >
                  {messageRule.text}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white border border-[#b2b2b2] rounded-[10px] w-full">
          <div className="text-start px-4 py-2">
            <p className="font-medium">School year</p>
          </div>
          <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5" />

          <form
            onSubmit={handleSaveSchoolYear}
            className="flex flex-col gap-4 px-4 py-4"
          >
            <div className="flex flex-row gap-5">
              <div className="flex flex-col items-start gap-1">
                <label htmlFor="startDate" className="font-medium pl-2">
                  School year starts
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col items-start gap-1">
                <label htmlFor="dateEnd" className="font-medium pl-2">
                  School year ends
                </label>
                <input
                  id="dateEnd"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <p className="text-sm text-[#8a90a3] pl-2 text-start">
              The first and last day of the school year. Leave credits are given
              at the start date, and loans must be fully paid by the end date.
              Update these dates each year.
            </p>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={savingSchoolYear || !settings}
                className="px-6 py-2 rounded-full bg-[#2AAF56] hover:bg-[#6675EC] disabled:opacity-60 text-white font-medium"
              >
                {savingSchoolYear ? "Saving..." : "Save"}
              </button>
              {messageSchoolYear && (
                <p
                  role="status"
                  className={
                    messageSchoolYear.ok ? "text-[#2AAF56]" : "text-red-500"
                  }
                >
                  {messageSchoolYear.text}
                </p>
              )}
            </div>
          </form>
        </div>

        <Containers
          name="Employee schedules"
          search={search}
          setSearch={setSearch}
          header={
            <p className="text-sm text-[#8a90a3] text-start">
              The start time is set in each employee&apos;s profile. The end
              time is the start time plus their working hours per day.
            </p>
          }
          currentPage={page}
          setCurrentPage={goToPage}
          totalPages={lastPage}
          total={total}
          arrowSize={32}
          spacing={false}
        >
          <div className="w-full overflow-x-auto">
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
                {rowsLoading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-[#8a90a3]"
                    >
                      Loading...
                    </td>
                  </tr>
                )}
                {!rowsLoading && rowsError && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-red-500"
                    >
                      Could not load the employee schedules.
                    </td>
                  </tr>
                )}
                {!rowsLoading && !rowsError && schedule.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-[#8a90a3]"
                    >
                      {searchSent
                        ? "No employee matches that name."
                        : "No employees yet."}
                    </td>
                  </tr>
                )}
                {!rowsLoading &&
                  !rowsError &&
                  schedule.map((r) => (
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
        </Containers>
      </div>
    </>
  );
}
