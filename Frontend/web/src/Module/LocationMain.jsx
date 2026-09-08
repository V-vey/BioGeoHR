import Map from "@/components/Map";
import Sidebar from "@/components/layout";
import { Outlet } from "react-router-dom";
export default function Location() {
  const nav = "Location";
  return (
    <>
      <Outlet />
    </>
  );
}
