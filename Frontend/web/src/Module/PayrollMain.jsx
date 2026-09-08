import Sidebar from "@/components/layout";
export default function PayrollMain() {
  const nav = "Payroll";
  return (
    <>
      <Sidebar nav={nav}>
        <div className="h-4" />

        <Outlet />
      </Sidebar>
    </>
  );
}
