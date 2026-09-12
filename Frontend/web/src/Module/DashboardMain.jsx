import Sidebar from "@/components/layout";

import SidebarV from "@/components/sidebar-v2";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <>
      <Sidebar>
        <Outlet />
      </Sidebar>
    </>
  );
}
