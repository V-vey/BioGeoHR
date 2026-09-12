import { useEffect, useState } from "react";
import Containers from "../components/container.jsx";
import Item from "@/components/Attendance/item-container.jsx";
import { useFilterPanel } from "../hooks/useFilterPanel.js";
import { Link } from "react-router-dom";

export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Data fetching goes here once the backend is connected.
  }, []);

  return (
    <>
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">Attendance</h2>
      </div>
      {/* Card Container */}
      <Containers
        name="Attendance"
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
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />
        <Item
          date={"April 7, 2026"}
          location={"Office"}
          name={"Abdul Jackul"}
          department={"HR"}
          position={"Product Manager"}
          status={"On-Time"}
          clockIn={"10:00 AM"}
          clockOut={"4:00 PM"}
        />

        {/* your table/list rows */}
      </Containers>

      {/* Floating Action Button (FAB) */}
      <Link
        className="fixed right-[26px] bottom-[26px] inline-flex items-center gap-2 p-[12px_22px] border-none rounded-[10px] bg-[#22c55e] text-white text-sm font-bold no-underline shadow-[0_8px_20px_rgba(34,197,94,0.35)] cursor-pointer hover:bg-opacity-95"
        to="location"
        // still not working
      >
        Create Location ⊕
      </Link>
    </>
  );
}
