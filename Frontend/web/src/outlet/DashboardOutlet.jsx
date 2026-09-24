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

  const flaggedHeader = (
    <div className="flex flex-row justify-between items-center">
      <h2 className="flex items-start ">Flagged Attendance</h2>
      <Link
        to="/attendance/flagged"
        className="text-s text-[#6675EC] hover:underline self-end mt-1"
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
        className="text-s text-[#6675EC] hover:underline self-end mt-1"
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

  const [currentPageLeave, setCurrentPageLeave] = useState(1);
  const [currentPageFlagged, setCurrentPageFlagged] = useState(1);

  return (
    <>
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px]  bg-white border border-[#b2b2b2] rounded-[14px]">
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
          icon={<DoorOpen className="text-[#6675EC] w-10 h-10 text-[10px] " />}
        />
      </div>
      <div className="h-4" />
      <div className="flex flex-wrap gap-4">
        {/* 1. Weekly Attendance Card (Bigger) */}

        <div className="flex-2">
          <Containers
            name="Weekly Attendance"
            searchShow={false}
            currentPage={currentPageFlagged}
            setCurrentPage={setCurrentPageFlagged}
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
            currentPage={currentPageFlagged}
            setCurrentPage={setCurrentPageFlagged}
            arrowSize={32}
            headerDefault={false}
            // Header of the calendar
            // header={flaggedHeader}
            minH={400}
            maxH={400}
          >
            <Calendar />
          </Containers>
        </div>

        <div className="flex-2">
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
          >
            <FlaggedSummary />
          </Containers>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex-3">
          <Containers
            name="Employee List"
            searchShow={false}
            currentPage={currentPageFlagged}
            setCurrentPage={setCurrentPageFlagged}
            arrowSize={32}
          >
            <EmployeeList />
          </Containers>
        </div>

        <div className="flex-2">
          <Containers
            name="Pending Leave"
            currentPage={currentPageLeave}
            setCurrentPage={setCurrentPageLeave}
            searchShow={false}
            arrowSize={32}
            minH={400}
            maxH={400}
            header={leaveHeader}
            headerDefault={false}
          >
            <PendingLeave />
          </Containers>
        </div>
      </div>
    </>
  );
}
