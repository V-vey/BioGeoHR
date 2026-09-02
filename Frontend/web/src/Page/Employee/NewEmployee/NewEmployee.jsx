import Sidebar from "@/components/layout";
export default function NewEmployee() {
  const nav = "New Employee";
  return (
    <>
      <Sidebar nav={nav}>
        <div>New Employee</div>
      </Sidebar>
    </>
  );
}
