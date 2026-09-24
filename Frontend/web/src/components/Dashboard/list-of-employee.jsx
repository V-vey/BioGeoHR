import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";

export default function ListOfEmployee() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(url + "/attendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        const today = new Date().toISOString().slice(0, 10);
        const todaysRecords = response.data.filter((r) => r.date === today);
        setEmployees(todaysRecords.slice(0, 5));
      } catch (error) {
        console.error("Failed to load employee list:", error);
      }
    };
    fetchEmployees();
  }, []);

  if (employees.length === 0) {
    return (
      <p className="text-sm text-[#8a90a3] text-center py-4">
        No attendance recorded today.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {employees.map((emp, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-[#eef0f5] pb-2 last:border-b-0"
        >
          <div className="flex flex-col">
            <p className="m-0 font-semibold text-[#3A3A3A] text-[14px]">
              {emp.name}
            </p>
            <p className="m-0 text-[#8a90a3] text-[12px]">
              {emp.department} | {emp.position}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="m-0 text-[13px] font-semibold text-[#3A3A3A]">
              {emp.status}
            </p>
            <p className="m-0 text-[12px] text-[#8a90a3]">
              {emp.contractType}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
