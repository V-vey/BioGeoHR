import Sidebar from "@/components/layout";
import { Outlet } from "react-router-dom";
export default function LeaveRequest() {
  const nav = "Leave Request";
  return (
    <>
      <Sidebar nav={nav}>
        <div className="h-4" />

        <Outlet />
      </Sidebar>
    </>
  );
}
