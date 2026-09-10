import Sidebar from "@/components/layout";
import { Outlet } from "react-router-dom";
export default function NewEmployee() {
  const nav = "New Employee";
  return (
    <>
      <Outlet />
    </>
  );
}
