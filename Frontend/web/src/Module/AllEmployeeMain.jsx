import Sidebar from "@/components/layout";
export default function AllEmployee() {
  const nav = "All Employee";
  return (
    <>
      <Sidebar nav={nav}>
        <div className="h-4" />

        <Outlet />
      </Sidebar>
    </>
  );
}
