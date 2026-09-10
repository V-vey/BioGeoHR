import Sidebar from "@/components/layout";
import { Outlet } from "react-router-dom";
export default function PayrollMain() {
  const nav = "Payroll";
  return (
    <>
      <Sidebar nav={nav}>
        <div className="h-4" />

        <Outlet />
      </Sidebar>
    </>
  );
}
