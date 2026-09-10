import Containers from "@/components/container";
import { useState } from "react";

export default function AllEmployee({}) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
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
    </Containers>
  );
}
