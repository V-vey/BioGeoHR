import Counts from "@/components/Dashboard/counts";
import Calendar from "@/components/Dashboard/calendar";
import WeeklyAttendance from "@/components/Dashboard/weekly-attendance";

import LeaveLayout from "@/components/Dashboard/leave-request";
import EmployeeList from "@/components/Dashboard/list-of-employee";
import PendingLeave from "@/components/Dashboard/pending-leave";
import FlaggedSummary from "@/components/Dashboard/flagged-summary";
import { useState, useEffect, useRef } from "react";
import Containers from "@/components/container";
import Test from "@/components/Dashboard/testingCard";
import Loading from "@/components/Loading";
import CalendarV from "@/components/Dashboard/calendarV2";

import axios from "axios";
import { url } from "@/resources/api";
import { Link } from "react-router-dom";
import { useDataChanged } from "@/lib/dataChanged";
// ICONS
import {
  Users,
  Clock,
  History,
  TriangleAlert,
  DoorOpen,
  Hourglass,
} from "lucide-react";
import LeaveRequest from "@/Module/LeaveRequestMain";
// the day the absences were last marked in this visit: the dashboard does it once a day, not at every visit
let lastAbsenceSync = "";
const todayKey = () => new Date().toLocaleDateString("en-CA");

export default function DashboardOutlet() {
  const [pending, setPending] = useState(5);
  const done = () => setPending((p) => Math.max(0, p - 1));
  // bumped when the Notifier reports something new, so the cards below ask the server again
  const [attTick, setAttTick] = useState(0);
  const [flagTick, setFlagTick] = useState(0);
  const [leaveTick, setLeaveTick] = useState(0);

  // Absences: employees with no record on a past working day are marked absent. This used to run when HR logged
  // in; it runs here now, before the cards ask for their numbers, so the absent counts are right the first time.
  // A failure must not stop the page.
  const [synced, setSynced] = useState(() => lastAbsenceSync === todayKey());
  useEffect(() => {
    if (synced) return;
    axios
      .post(
        url + "/attendance/sync-absences",
        {},
        { headers: { "ngrok-skip-browser-warning": "true" } },
      )
      .catch((error) => console.error("Absence sync failed:", error))
      .finally(() => {
        lastAbsenceSync = todayKey();
        setSynced(true);
      });
  }, [synced]);
  //Calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  // 1. Find the weekday alignment for the 1st of the month (0 = Sun, 1 = Mon, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // 2. Fetch the total number of days in the active month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  // 3. Navigation triggers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  // 5. Build layout cells
  const calendarHeader = (
    // justify-between when there is a button
    <div className="flex items-center justify-between ">
      <button
        onClick={prevMonth}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm focus:outline-none"
      >
        &lt;
      </button>
      <h2 className="text-lg font-bold text-[#6675EC] items-center">
        {months[month]} {year}
      </h2>
      <button
        onClick={nextMonth}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm focus:outline-none"
      >
        &gt;
      </button>
    </div>
  );

  //Attendance Count
  const [metrics, setMetrics] = useState({
    countEmployees: 0,
    countAttendance: 0,
    countLate: 0,
    countAbsent: 0,
    countLeave: 0,
    countNotYetIn: 0, // no attendance today and not on leave
    nonWorkingDay: false, // a weekend or a holiday: nobody is expected

    percentageAttendance: 0,
    percentageLate: 0,
    percentageAbsent: 0,
    percentageLeave: 0,
    percentageNotYetIn: 0,
  });

  useEffect(() => {
    if (!synced) return; // wait for the absences to be marked
    const fetchData = async () => {
      try {
        const response = await axios.get(url + "/attendanceCounts", {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          "ngrok-skip-browser-warning": "true",
        });
        console.log(response.data);

        // percent with 2 decimals; 0.00 when there are no employees (avoids NaN)
        const pct = (count, total) =>
          total ? ((count / total) * 100).toFixed(2) : "0.00";

        setMetrics({
          countEmployees: response.data.employees,
          countAttendance: response.data.on_time,
          countLate: response.data.late,
          countAbsent: response.data.absent,
          countLeave: response.data.leave,
          countNotYetIn: response.data.not_yet_in ?? 0,
          nonWorkingDay: response.data.non_working_day === true,

          percentageAttendance: pct(
            response.data.on_time,
            response.data.employees,
          ),
          percentageLate: pct(response.data.late, response.data.employees),
          percentageAbsent: pct(response.data.absent, response.data.employees),
          percentageLeave: pct(response.data.leave, response.data.employees),
          percentageNotYetIn: pct(
            response.data.not_yet_in ?? 0,
            response.data.employees,
          ),
        });
      } catch (error) {
        console.error("Something went wrong", error);
      } finally {
        done();
      }
    };
    fetchData();
  }, [attTick, leaveTick, synced]);

  //FLAGGED
  const [flagged, setFlagged] = useState([]);
  //custome header
  const flaggedHeader = (
    <div className="flex flex-row justify-between items-center">
      <div className="flex items-start text-[21px] text-[#6675EC] font-medium">
        Flagged Attendance
      </div>
      <Link
        to="/attendance/flagged"
        className="text-s text-[#f2f2f2] bg-[#6675EC] px-4 hover:bg-[#6675EC]/80 self-end rounded-[10px]"
      >
        View All
      </Link>
    </div>
  );
  useEffect(() => {
    const fetchFlagged = async () => {
      try {
        const response = await axios.get(
          url + "/flaggedAttendance?today=true",
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        setFlagged(response.data);
      } catch (error) {
        console.error("Failed to load flagged attendance:", error);
      } finally {
        done();
      }
    };
    fetchFlagged();
  }, [flagTick]);
  const [searchFlagged, setSearchFlagged] = useState("");
  const [currentPageFlagged, setCurrentPageFlagged] = useState(1);
  const filteredFlagged = flagged
    .filter((flag) =>
      flag.user?.name?.toLowerCase().includes(searchFlagged.toLowerCase()),
    )
    .reverse();

  const itemsPerPage = 4;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFlagged.length / itemsPerPage),
  );
  const startIndex = (currentPageFlagged - 1) * itemsPerPage;
  const pageItemsFlagged = filteredFlagged.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  //lEAVE
  const [leaves, setLeaves] = useState([]);
  const [searchLeave, setSearchLeave] = useState("");
  const [currentPageLeave, setCurrentPageLeave] = useState(1);

  const fetchPending = async () => {
    try {
      const headers = {
        "ngrok-skip-browser-warning": "true",
      };
      const response = await axios.get(url + "/leave", { headers });
      setLeaves(response.data.filter((leave) => leave.status === "Pending"));
    } catch (error) {
      console.error("Failed to load pending leave:", error);
    } finally {
      done();
    }
  };
  useEffect(() => {
    fetchPending();
  }, []);

  useDataChanged(["attendance"], () => setAttTick((n) => n + 1));
  useDataChanged(["flag"], () => setFlagTick((n) => n + 1));
  useDataChanged(["leave"], () => {
    setLeaveTick((n) => n + 1);
    fetchPending();
  });

  const leaveHeader = (
    <div className="flex flex-row justify-between items-center">
      <h2 className="flex items-start ">Pending Leave</h2>
      <Link
        to="/employee/leave-request"
        className="text-s text-[#f2f2f2] bg-[#6675EC] px-4 hover:bg-[#6675EC]/80 self-end rounded-[10px]"
      >
        View All
      </Link>
    </div>
  );

  // const [currentPageLeave, setCurrentPageFlagged] = useState(1);
  const filteredLeave = leaves
    .filter((leave) =>
      leave.user?.name?.toLowerCase().includes(searchLeave.toLowerCase()),
    )
    .reverse();

  const itemsPerPageLeave = 3;

  const totalPagesLeave = Math.max(
    1,
    Math.ceil(filteredLeave.length / itemsPerPageLeave),
  );
  const startIndexLeave = (currentPageLeave - 1) * itemsPerPageLeave;
  const pageItemsLeave = filteredLeave.slice(
    startIndexLeave,
    startIndexLeave + itemsPerPageLeave,
  );

  //WEEKLY ATTENDANCE
  const weeklyHeader = (
    <div className="flex flex-row justify-center items-center">
      <h2 className="flex items-center">Weekly Attendance</h2>
    </div>
  );
  const [weeklyData, setWeeklyData] = useState([]);
  useEffect(() => {
    if (!synced) return;
    const fetchWeekly = async () => {
      try {
        const response = await axios.get(url + "/weeklyAttendance", {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        setWeeklyData(response.data);
      } catch (error) {
        console.error("Failed to load weekly attendance:", error);
      } finally {
        done();
      }
    };
    fetchWeekly();
  }, [synced]);

  //EMPLOYEE
  // Every active employee with what today looks like for them (On-Time, Late, Absent, On Leave,
  // Not Yet In), one page at a time: the server searches, counts and pages it.
  const EMP_PER_PAGE = 5;
  const [employees, setEmployees] = useState([]); // the records of the current page only
  // null until the first answer, so the card does not say "No employees found" while loading
  const [totalEmp, setTotalEmp] = useState(null);
  const [totalPagesEmp, setTotalPagesEmp] = useState(1);
  const [currentPageEmp, setCurrentPageEmp] = useState(1);
  const [searchEmp, setSearchEmp] = useState("");
  const [searchEmpSent, setSearchEmpSent] = useState("");
  const empLoaded = useRef(false);
  // true while a new page or a new search is on its way (the first load has the full-screen box)
  const [empLoading, setEmpLoading] = useState(false);
  const empKey = useRef("");

  // wait for a pause in typing before asking the server, and start again at page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchEmpSent(searchEmp.trim());
      setCurrentPageEmp(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchEmp]);

  useEffect(() => {
    if (!synced) return;
    let cancelled = false;
    // show the loading text for a page or search the employee asked for, not for the quiet refresh
    // that runs when a clock-in or leave changes
    const key = `${currentPageEmp}|${searchEmpSent}`;
    if (empLoaded.current && key !== empKey.current) setEmpLoading(true);
    empKey.current = key;

    const fetchEmployees = async () => {
      try {
        const params = { page: currentPageEmp, per_page: EMP_PER_PAGE };
        if (searchEmpSent) params.search = searchEmpSent;
        const response = await axios.get(url + "/dashboardEmployees", {
          params,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (cancelled) return;
        const page = response.data;
        setEmployees(page.data);
        setTotalEmp(page.total);
        setTotalPagesEmp(Math.max(1, page.last_page));
        if (
          page.data.length === 0 &&
          page.total > 0 &&
          currentPageEmp > page.last_page
        )
          setCurrentPageEmp(page.last_page);
      } catch (error) {
        console.error("Failed to load employee list:", error);
      } finally {
        if (!cancelled) setEmpLoading(false); // a newer request has taken over otherwise
        if (!empLoaded.current) {
          empLoaded.current = true;
          done();
        }
      }
    };
    fetchEmployees();
    return () => {
      cancelled = true;
    };
  }, [currentPageEmp, searchEmpSent, attTick, leaveTick, synced]);
  const employeeHeader = (
    <div className="flex flex-row justify-between items-center">
      <h2 className="flex items-start ">Employee List</h2>
      {/* search */}
      <div className="flex flex-row gap-2">
        <input
          type="search"
          name="search"
          id="search"
          placeholder="Search Name"
          value={searchEmp}
          onChange={(e) => setSearchEmp?.(e.target.value)}
          className="border-[#8E8E8E] border-1 rounded-2xl w-100 px-3"
        />
        <Link
          to="/employee"
          className="text-s text-[#f2f2f2] bg-[#6675EC] px-4 hover:bg-[#6675EC]/80 self-end rounded-[10px]"
        >
          View All
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      {pending > 0 && <Loading />}
      <div className="flex flex-col gap-4">
        <div className=" flex justify-end p-4 md:p-[16px_20px]  bg-white border border-[#b2b2b2] rounded-[14px]">
          <h2 className="text-[#6675EC] font-bold justify-end">Dashboard</h2>
        </div>
        {/* Dashboard Metrics Counts */}
        <div className="flex w-full justify-between gap-4">
          <Counts
            className="flex-1 "
            display="Total Employees"
            count={metrics.countEmployees}
            icon={<Users className="text-[#6675EC] w-10 h-10 text-[20px] " />}
          />
          <Counts
            className="flex-1"
            display="On-Time Employees"
            count={metrics.countAttendance}
            percentage={`${metrics.percentageAttendance}% of Employees`}
            icon={<Clock className="text-[#2AAF56] w-10 h-10 text-[10px] " />}
          />
          <Counts
            className="flex-1"
            display="Late Employees"
            count={metrics.countLate}
            percentage={`${metrics.percentageLate}% of Employees`}
            icon={<History className="text-[#EACA3A] w-10 h-10 text-[10px] " />}
          />
          <Counts
            className="flex-1"
            display="Not Yet In"
            count={metrics.countNotYetIn}
            percentage={
              metrics.nonWorkingDay
                ? "Non-working day"
                : `${metrics.percentageNotYetIn}% of Employees`
            }
            icon={
              <Hourglass className="text-[#8a90a3] w-10 h-10 text-[10px] " />
            }
          />
          <Counts
            className="flex-1"
            display="Absent Employees"
            count={metrics.countAbsent}
            percentage={`${metrics.percentageAbsent}% of Employees`}
            icon={
              <TriangleAlert className="text-[#EC6668] w-10 h-10 text-[10px] " />
            }
          />
          <Counts
            className="flex-1"
            display="On Leave"
            count={metrics.countLeave}
            percentage={`${metrics.percentageLeave}% of Employees`}
            icon={
              <DoorOpen className="text-[#6675EC] w-10 h-10 text-[10px] " />
            }
          />
        </div>
        {/* <div className="h-4" /> */}
        <div className="flex flex-wrap gap-4">
          {/* 1. Weekly Attendance Card (Bigger) */}

          <div className="flex-2">
            <Containers
              name="Weekly Attendance"
              searchShow={false}
              arrowSize={32}
              headerDefault={false}
              header={weeklyHeader}
              minH={400}
              maxH={400}
              pageShow={false}
            >
              <WeeklyAttendance chartData={weeklyData} />
            </Containers>
          </div>

          {/* 2. Calendar Card (Smaller) */}
          <div className="flex-1">
            <Containers
              searchShow={false}
              arrowSize={32}
              headerDefault={false}
              // Header of the calendar
              header={calendarHeader}
              minH={400}
              maxH={400}
              pageShow={false}
            >
              <Calendar month={month} year={year} />
            </Containers>
          </div>

          <div className="flex-1">
            <Containers
              name="Flagged Attendance"
              searchShow={false}
              currentPage={currentPageFlagged}
              setCurrentPage={setCurrentPageFlagged}
              arrowSize={32}
              headerDefault={false}
              header={flaggedHeader}
              minH={400}
              maxH={400}
              totalPages={totalPages}
              total={filteredFlagged.length}
              perPage={itemsPerPage}
              emptyText="No flagged attendance."
              pageShow={false}
            >
              {pageItemsFlagged.map((flag, i) => (
                <FlaggedSummary key={i} flagged={flag} />
              ))}
            </Containers>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-3">
            <Containers
              name="Employee List"
              searchShow={false}
              currentPage={currentPageEmp}
              setCurrentPage={setCurrentPageEmp}
              arrowSize={32}
              minH={380}
              maxH={380}
              headerDefault={false}
              header={employeeHeader}
              totalPages={totalPagesEmp}
              total={totalEmp}
              perPage={EMP_PER_PAGE}
              emptyText="No employees found."
              loading={empLoading}
              spacing={false}
            >
              <div className="relative w-full justify-start">
                <div className="flex flex-row items-center gap-3 border-b border-[#b2b2b2] px-4 py-1">
                  <p className="flex-1 text-start font-medium">Name</p>
                  <p className="flex-1 text-start font-medium">Department</p>
                  <p className="flex-1 text-start font-medium">Position</p>
                  <p className="flex-1 text-start font-medium">Attendance</p>
                  <p className="flex-1 text-start font-medium">Contract Type</p>
                </div>
                <div className="h-2" />
                <div
                  className={`flex flex-col gap-2 transition-opacity ${empLoading ? "opacity-40 pointer-events-none" : ""}`}
                >
                  {employees.map((emp, i) => (
                    <EmployeeList emp={emp} key={i} />
                  ))}
                </div>
                {empLoading && (
                  <div className="absolute inset-x-0 top-1/2 flex justify-center pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-white border border-[#b2b2b2] text-sm font-medium animate-pulse">
                      Loading...
                    </span>
                  </div>
                )}
              </div>
            </Containers>
          </div>

          <div className="flex-2">
            <Containers
              name="Pending"
              currentPage={currentPageLeave}
              setCurrentPage={setCurrentPageLeave}
              totalPages={totalPagesLeave}
              total={filteredLeave.length}
              perPage={itemsPerPageLeave}
              emptyText="No pending leave requests."
              searchShow={false}
              arrowSize={32}
              minH={380}
              maxH={380}
              header={leaveHeader}
              headerDefault={false}
            >
              {pageItemsLeave.map((leave) => (
                <PendingLeave
                  fetch={fetchPending}
                  key={leave.id}
                  item={leave}
                />
              ))}
            </Containers>
          </div>
        </div>
      </div>
    </div>
  );
}
