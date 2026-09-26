import Counts from "@/components/Dashboard/counts";
import Calendar from "@/components/Dashboard/calendar";
import WeeklyAttendance from "@/components/Dashboard/weekly-attendance";

import LeaveLayout from "@/components/Dashboard/leave-request";
import EmployeeList from "@/components/Dashboard/list-of-employee";
import PendingLeave from "@/components/Dashboard/pending-leave";
import FlaggedSummary from "@/components/Dashboard/flagged-summary";
import { useState, useEffect } from "react";
import Containers from "@/components/container";
import Test from "@/components/Dashboard/testingCard";

import CalendarV from "@/components/Dashboard/calendarV2";

import axios from "axios";
import { url } from "@/resources/api";
import { Link } from "react-router-dom";
// ICONS
import { Users, Clock, History, TriangleAlert, DoorOpen } from "lucide-react";
import LeaveRequest from "@/Module/LeaveRequestMain";
export default function DashboardOutlet() {
  //Calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

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

  // 4. Capture clicked date
  const handleDateClick = (day) => {
    setSelectedDate(new Date(year, month, day));
  };

  // 5. Build layout cells

  //counts
  const [metrics, setMetrics] = useState({
    countEmployees: 0,
    countAttendance: 0,
    countLate: 0,
    countAbsent: 0,
    countLeave: 0,

    percentageAttendance: 0,
    percentageLate: 0,
    percentageAbsent: 0,
    percentageLeave: 0,
  });
  const [flagged, setFlagged] = useState([]);
  const [leave, setLeave] = useState([]);

  //custome header
  const flaggedHeader = (
    <div className="flex flex-row justify-between items-center">
      <div className="flex items-start text-[21px] text-[#6675EC] font-medium">
        Flagged Attendance
      </div>
      <Link
        to="/attendance/flagged"
        className="text-s text-[#f2f2f2] bg-[#6675EC] px-4 hover:bg-[#2AAF56] self-end rounded-[10px]"
      >
        View All
      </Link>
    </div>
  );
  const leaveHeader = (
    <div className="flex flex-row justify-between items-center">
      <h2 className="flex items-start ">Pending Leave</h2>
      <Link
        to="/attendance/leave-request"
        className="text-s text-[#f2f2f2] bg-[#6675EC] px-4 hover:bg-[#2AAF56] self-end rounded-[10px]"
      >
        View All
      </Link>
    </div>
  );

  const weeklyHeader = (
    <div className="flex flex-row justify-center items-center">
      <h2 className="flex items-center">Weekly Attendance</h2>
    </div>
  );

  const calendarHeader = (
    // justify-between when there is a button
    <div className="flex items-center justify-center ">
      {/* <button
        onClick={prevMonth}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm focus:outline-none"
      >
        &lt;
      </button> */}
      <h2 className="text-lg font-bold text-[#6675EC] items-center">
        {months[month]} {year}
      </h2>
      {/* <button
        onClick={nextMonth}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm focus:outline-none"
      >
        &gt;
      </button> */}
    </div>
  );

  //fetching data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchData = async () => {
      try {
        const response = await axios.get(url + "/attendanceCounts", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          "ngrok-skip-browser-warning": "true",
        });
        console.log(response.data);

        setMetrics({
          countEmployees: response.data.employees,
          countAttendance: response.data.on_time,
          countLate: response.data.late,
          countAbsent: response.data.absent,
          countLeave: response.data.leave,

          percentageAttendance:
            (response.data.on_time / response.data.employees) * 100,
          percentageLate: (response.data.late / response.data.employees) * 100,
          percentageAbsent:
            (response.data.absent / response.data.employees) * 100,
          percentageLeave:
            (response.data.leave / response.data.employees) * 100,
        });
      } catch (error) {
        console.error("Something went wrong", error);
      }
    };
    fetchData();
  }, []);

  const [weeklyData, setWeeklyData] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchWeekly = async () => {
      try {
        const response = await axios.get(url + "/weeklyAttendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setWeeklyData(response.data);
      } catch (error) {
        console.error("Failed to load weekly attendance:", error);
      }
    };
    fetchWeekly();
  }, []);

  // change to today flagged
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchFlagged = async () => {
      try {
        const response = await axios.get(url + "/flaggedAttendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setFlagged(response.data);
      } catch (error) {
        console.error("Failed to load flagged attendance:", error);
      }
    };
    fetchFlagged();
  }, []);

  const [employees, setEmployees] = useState([]);

  // change to today attendance
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(url + "/attendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        const today = new Date().toISOString().slice(0, 10);
        const todaysRecords = response.data.filter((r) => r.date === today);
        setEmployees(todaysRecords);
      } catch (error) {
        console.error("Failed to load employee list:", error);
      }
    };
    fetchEmployees();
  }, []);

  const [currentPageEmp, setCurrentPageEmp] = useState(1);
  const [searchEmp, setSearchEmp] = useState("");
  const handleSearch = (value) => {
    setSearchEmp(value);
    setCurrentPageEmp(1);
  };

  const filteredEmp = employees
    .filter((emp) => emp.name.toLowerCase().includes(searchEmp.toLowerCase()))
    .reverse();

  const itemsPerPageEmp = 5;
  const totalPagesEmp = Math.max(
    1,
    Math.ceil(filteredEmp.length / itemsPerPageEmp),
  );
  const startIndexEmp = (currentPageEmp - 1) * itemsPerPageEmp;
  const pageItemsEmp = filteredEmp.slice(
    startIndexEmp,
    startIndexEmp + itemsPerPageEmp,
  );

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
          to="/attendance/leave-request"
          className="text-s text-[#f2f2f2] bg-[#6675EC] px-4 hover:bg-[#2AAF56] self-end rounded-[10px]"
        >
          View All
        </Link>
      </div>
    </div>
  );

  //pagest
  const [currentPageLeave, setCurrentPageLeave] = useState(1);
  const [currentPageFlagged, setCurrentPageFlagged] = useState(1);
  const [currentPageEmployee, setCurrentPageEmployee] = useState(1);
  const [search, setSearch] = useState("");

  const filteredFlagged = flagged
    .filter((flag) =>
      flag.user?.name?.toLowerCase().includes(search.toLowerCase()),
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
  return (
    <>
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
            display="Absent Employees"
            count={metrics.countAbsent}
            percentage={`${metrics.percentageAbsent}% of Employees`}
            icon={
              <TriangleAlert className="text-[#EC6668] w-10 h-10 text-[10px] " />
            }
          />
          <Counts
            className="flex-1"
            display="Total Leave"
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
              <Calendar
                month={month}
                year={year}
                selectedDate={selectedDate}
                onDateClick={handleDateClick}
              />
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
              minH={350}
              maxH={350}
              headerDefault={false}
              header={employeeHeader}
              totalPages={totalPagesEmp}
              spacing={false}
            >
              <div className="w-full justify-start">
                <div className="flex flex-row items-center bg-[#E0E0E0] px-4 py-1">
                  <p className="flex-1 text-start font-medium">Name</p>
                  <p className="flex-1 text-start font-medium">Department</p>
                  <p className="flex-1 text-start font-medium">Position</p>
                  <p className="flex-1 text-start font-medium">Attendance</p>
                  <p className="flex-1 text-start font-medium">Contract Type</p>
                </div>
                <div className="h-2" />
                <div className="flex flex-col gap-2">
                  {pageItemsEmp.map((emp, i) => (
                    <EmployeeList emp={emp} key={i} />
                  ))}
                </div>
              </div>
            </Containers>
          </div>

          <div className="flex-2">
            <Containers
              name="Pending Leave"
              currentPage={currentPageLeave}
              setCurrentPage={setCurrentPageLeave}
              searchShow={false}
              arrowSize={32}
              minH={350}
              maxH={350}
              header={leaveHeader}
              headerDefault={false}
            >
              <PendingLeave />
            </Containers>
          </div>
        </div>
      </div>
    </>
  );
}
