import Sidebar from "@/components/layout";
export default function PayrollMain() {
  const nav = "Payroll";
  return (
    <>
      <Sidebar nav={nav}>
        <div>Payroll</div>
      </Sidebar>
    </>
  );
}
