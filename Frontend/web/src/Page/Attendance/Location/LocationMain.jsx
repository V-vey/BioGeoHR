import Map from "./Map";
import Sidebar from "@/components/layout";
export default function Location() {
  const nav = "Location";
  return (
    <>
      <Sidebar nav={nav}>
        <Map />
      </Sidebar>
    </>
  );
}
