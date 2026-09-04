import Counts from "@/components/Dashboard/counts";
import Calendar from "@/components/Dashboard/calendar";
import { useState, useEffect } from "react";
// ICONS
import { Users, Clock, History, TriangleAlert, DoorOpen } from "lucide-react";
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

  return (
    <>
      {/* Dashboard Metrics Counts */}
      <div class="flex w-full justify-between gap-4">
        <Counts
          className="flex-1 "
          display="Total Employees"
          count={metrics.countEmployees}
          icon={<Users className="text-[#6675EC] w-11.5 h-11.5 text-[20px] " />}
        />
        <Counts
          className="flex-1"
          display="Total Attendance"
          count={metrics.countAttendance}
          percentage={`${metrics.percentageAttendance}% of Employees`}
          icon={<Clock className="text-[#2AAF56] w-11.5 h-11.5 text-[20px] " />}
        />
        <Counts
          className="flex-1"
          display="Late Employees"
          count={metrics.countLate}
          percentage={`${metrics.percentageLate}% of Employees`}
          icon={
            <History className="text-[#EACA3A] w-11.5 h-11.5 text-[20px] " />
          }
        />
        <Counts
          className="flex-1"
          display="Absent Employees"
          count={metrics.countAbsent}
          percentage={`${metrics.percentageAbsent}% of Employees`}
          icon={
            <TriangleAlert className="text-[#EC6668] w-11.5 h-11.5 text-[20px] " />
          }
        />
        <Counts
          className="flex-1"
          display="Total Leave"
          count={metrics.countLeave}
          percentage={`${metrics.percentageLeave}% of Employees`}
          icon={
            <DoorOpen className="text-[#6675EC] w-11.5 h-11.5 text-[20px] " />
          }
        />
      </div>

      {/* Weekly Overview */}
      {/* Calendar */}
      <Calendar />
      {/* List Employee */}
      {/* Leave Requests */}
    </>
  );
}
