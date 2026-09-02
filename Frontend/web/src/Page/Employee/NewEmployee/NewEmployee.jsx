import Map from "./Map";
import Sidebar from "@/components/layout";
export default function Location() {
  const nav = "New Employee";
  return (
    <>
      <Sidebar nav={nav}>
        <div>New Employee</div>
      </Sidebar>
    </>
  );
}
