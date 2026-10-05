import Sidebar from "@/components/layout";
import { Outlet } from "react-router-dom";
export default function AuditLogMain() {
  const nav = "Audit Log";
  return (
    <>
      <Sidebar nav={nav}>
        <div className="h-4" />
        <Outlet />
      </Sidebar>
    </>
  );
}
