import Counts from "@/components/Dashboard/counts";
import Calendar from "@/components/Dashboard/calendar";
import WeeklyAttendance from "@/components/Dashboard/weekly-attendance";
import LeaveRequestLayout from "@/components/Dashboard/leave-request";
import { useState, useEffect } from "react";

import Test from "@/components/Dashboard/testingCard";
// ICONS
import { Users, Clock, History, TriangleAlert, DoorOpen } from "lucide-react";
import LeaveRequest from "@/Page/Employee/LeaveRequest/LeaveRequestMain";
export default function DashboardOutlet() {
  const num = 1;
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

  const chartData = [
    { day: "Sunday", ontime: num, late: num, absent: num, leave: num },
    { day: "Monday", ontime: num, late: num, absent: num, leave: num },
    { day: "Tuesday", ontime: num, late: num, absent: num, leave: num },
    { day: "Wednesday", ontime: num, late: num, absent: num, leave: num },
    { day: "Thursday", ontime: num, late: num, absent: num, leave: num },
    { day: "Friday", ontime: num, late: num, absent: num, leave: num },
    { day: "Saturday", ontime: num, late: num, absent: num, leave: num },
  ];

  return (
    <>
      {/* Dashboard Metrics Counts */}
      <div class="flex w-full justify-between gap-4">
        <Counts
          className="flex-1 "
          display="Total Employees"
          count={metrics.countEmployees}
          icon={<Users className="text-[#6675EC] w-10 h-10 text-[20px] " />}
        />
        <Counts
          className="flex-1"
          display="Total Attendance"
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
      <div className="h-4 bg-" />
      <div className="flex flex-wrap gap-4">
        {/* 1. Weekly Attendance Card (Bigger) */}
        <div className="flex-2 ">
          <WeeklyAttendance chartData={chartData} />
        </div>

        {/* 2. Calendar Card (Smaller) */}
        <div className="flex-1">
          <Calendar />
        </div>
        <div className="flex-2">
          <LeaveRequestLayout />
        </div>
      </div>
      <Test />
      {/* Weekly Overview */}

      {/* Calendar */}
      {/* </div> */}

      {/* List Employee */}
      {/* Leave Requests */}
    </>
  );
}
