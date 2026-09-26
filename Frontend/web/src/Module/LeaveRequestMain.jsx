import Sidebar from "@/components/layout";
import { Outlet } from "react-router-dom";
export default function LeaveRequest() {
  const nav = "Leave Request";
  return (
    <>
      <Outlet />
    </>
  );
}
