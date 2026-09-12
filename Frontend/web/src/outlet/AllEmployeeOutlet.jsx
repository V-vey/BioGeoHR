import Containers from "@/components/container";
import Item from "@/components/Employee/AllEmployee/item-container";
import { useState } from "react";

export default function AllEmployee({}) {
  const [currentPage, setCurrentPage] = useState(1);

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
        filterConfig={[
          {
            key: "availability",
            label: "Availabilty",
            type: "radio",
            options: ["Available", "Unavailable", "Break", "Leave"],
          },
          {
            key: "contractType",
            label: "Contract Type",
            type: "radio",
            options: ["Full-time", "Freelance", "Internship"],
          },
          {
            key: "department",
            label: "Department",
            type: "radio",
            options: ["Product", "Engineer", "Marketing", "Finance"],
          },
          { key: "joinedDate", label: "Joined Date", type: "dateRange" },
        ]}
        onFilterApply={(filters) => console.log(filters)}
      >
        {/* your table/list rows */}
        <Item
          id={202430004}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          contType={"Full-Time"}
          joinDate={"April 7, 2026"}
        />
      </Containers>
    </div>
  );
}
