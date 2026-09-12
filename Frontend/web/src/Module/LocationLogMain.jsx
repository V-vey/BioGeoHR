import Sidebar from "@/components/layout";
import { Outlet } from "react-router-dom";
export default function LocationLog() {
  const nav = "Location Log";
  return (
    <>
      <Outlet />
    </>
  );
}
