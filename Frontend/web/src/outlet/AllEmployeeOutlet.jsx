import Containers from "@/components/container";
import Item from "@/components/Employee/AllEmployee/item-container";
import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "@/resources/api";

export default function AllEmployee({}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(url + "/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setEmployees(response.data);
      } catch (error) {
        console.error("Failed to load employees", error);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div>
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">All Employee</h2>
      </div>
      <Containers
        name="Employees"
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        arrowSize={32}
        searchShow={true}
        filterConfig={
          [
            /* ...unchanged... */
          ]
        }
        onFilterApply={(filters) => console.log(filters)}
      >
        {employees.map((emp) => (
          <Item
            key={emp.id}
            id={emp.id}
            name={emp.name}
            department={emp.department}
            position={emp.position}
            contType={emp.contract_type}
            joinDate={new Date(emp.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          />
        ))}
      </Containers>
    </div>
  );
}
