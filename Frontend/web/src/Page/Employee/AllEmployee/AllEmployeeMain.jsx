import Map from "./Map";
import Sidebar from "@/components/layout";
export default function Location() {
  const nav = "All Employee";
  return (
    <>
      <Sidebar nav={nav}>
        <div>All Employee</div>
      </Sidebar>
    </>
  );
}
