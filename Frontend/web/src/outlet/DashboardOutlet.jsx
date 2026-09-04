import Counts from "@/components/Dashboard/counts";

// ICONS
import { Users, Clock, History, TriangleAlert, DoorOpen } from "lucide-react";
export default function DashboardOutlet() {
  return (
    <>
      <div class="flex w-full justify-between gap-4">
        <Counts
          className="flex-1 "
          display="Total Employees"
          count={"10,000"}
          icon={<Users className="text-[#6675EC] w-11.5 h-11.5 text-[20px] " />}
        />
        <Counts
          className="flex-1"
          display="Total Attendance"
          count={10}
          icon={<Clock className="text-[#2AAF56] w-11.5 h-11.5 text-[20px] " />}
        />
        <Counts
          className="flex-1"
          display="Late Employees"
          count={10}
          icon={
            <History className="text-[#EACA3A] w-11.5 h-11.5 text-[20px] " />
          }
        />
        <Counts
          className="flex-1"
          display="Absent Employees"
          count={10}
          icon={
            <TriangleAlert className="text-[#EC6668] w-11.5 h-11.5 text-[20px] " />
          }
        />
        <Counts
          className="flex-1"
          display="Total Leave"
          count={10}
          icon={
            <DoorOpen className="text-[#6675EC] w-11.5 h-11.5 text-[20px] " />
          }
        />
      </div>
    </>
  );
}
