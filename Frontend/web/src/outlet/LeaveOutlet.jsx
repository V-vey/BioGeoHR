import Containers from "@/components/container";
import Item from "@/components/Employee/LeaveRequest/item-container";
import { useState, useEffect } from "react";
import axios from "axios";
import { url } from "@/resources/api";
export default function Leave() {
  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(url + "/leave", {
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
    <div className="flex flex-col">
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">Leave</h2>
      </div>
      <Containers
        name="Leave"
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
        <Item
          id={"100"}
          name={"Abdul Jackul"}
          email={"abdul@gmail.com"}
          status={"Pending"}
          department={"HR"}
          position={"HR Head"}
          leaveType={"Sick Leave"}
          startDate={"April 13, 2026"}
          endDate={"April 13, 2026"}
        />
      </Containers>
    </div>
  );
}
