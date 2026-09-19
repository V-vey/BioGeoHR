import { useEffect, useState } from "react";
import Containers from "../components/container.jsx";
import Item from "@/components/Attendance/item-container.jsx";
import { useFilterPanel } from "../hooks/useFilterPanel.js";
import { Link } from "react-router-dom";

import { url } from "@/resources/api";
import axios from "axios";

import { format, parse } from "date-fns";

const formatTime = (timeStr) => {
  if (!timeStr) return "--:--";
  const parsed = parse(timeStr, "HH:mm:ss", new Date());
  return format(parsed, "h:mma"); // "11:00PM"
};

export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);

  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchAttendance = async () => {
      try {
        const response = await axios.get(url + "/attendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setAttendance(response.data);
      } catch (error) {
        console.error("Failed to Load Locations:", error);
      }
    };

    fetchAttendance();
  }, []);

  const [search, setSearch] = useState("");
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const filteredAttendance = attendance
    .filter((att) => att.name.toLowerCase().includes(search.toLowerCase()))
    .reverse();

  const itemsPerPage = 16;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAttendance.length / itemsPerPage),
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredAttendance.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
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
        searchShow={true}
        filterConfig={[]}
        // onFilterApply={(filters) => console.log(filters)}
        totalPages={totalPages}
        search={search}
        setSearch={handleSearch}
      >
        {pageItems.map((att, i) => (
          <Item
            key={i}
            date={format(new Date(att.date), "MMMM d, yyyy")}
            location={att.location}
            name={att.name}
            department={att.department}
            position={att.position}
            status={att.status}
            clockIn={formatTime(att.clockIn)}
            clockOut={formatTime(att.clockOut)}
          />
        ))}
      </Containers>

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
