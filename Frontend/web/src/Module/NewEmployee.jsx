import Sidebar from "@/components/layout";
export default function NewEmployee() {
  const nav = "New Employee";
  return (
    <>
      <Sidebar nav={nav}>
        <div className="h-4" />

        <Outlet />
      </Sidebar>
    </>
  );
}
