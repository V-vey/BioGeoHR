import Sidebar from "@/components/layout";
import { Outlet } from "react-router-dom";
export default function FlaggedAttendance() {
  const nav = "Flagged Attendance";
  return (
    <>
      <Outlet />
    </>
  );
}
