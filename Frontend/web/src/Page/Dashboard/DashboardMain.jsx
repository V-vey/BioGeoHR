import Sidebar from "@/components/layout";
export default function Dashboard() {
  const nav = "Dashboard";
  return (
    <>
      <Sidebar nav={nav}>
        <div>Dashboard</div>
      </Sidebar>
    </>
  );
}
