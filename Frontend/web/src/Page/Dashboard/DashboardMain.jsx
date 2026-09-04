import Sidebar from "@/components/layout";

import { Outlet } from "react-router-dom";

export default function Dashboard() {
  const nav = "Dashboard";
  return (
    <>
      <Sidebar nav={nav}>
        <div className="h-4" />
        <div>
          <Outlet />
        </div>
      </Sidebar>
    </>
  );
}
