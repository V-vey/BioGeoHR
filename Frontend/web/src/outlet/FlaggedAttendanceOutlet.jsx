import { useEffect, useState } from "react";
import Containers from "@/components/container";
import FlaggedItem from "@/components/Attendance/flagged-item-container";
import axios from "axios";
import { url } from "@/resources/api";
import { format } from "date-fns";

export default function FlaggedAttendanceOutlet() {
  const [currentPage, setCurrentPage] = useState(1);
  const [flagged, setFlagged] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchFlagged = async () => {
      try {
        const response = await axios.get(url + "/flaggedAttendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setFlagged(response.data);
      } catch (error) {
        console.error("Failed to load flagged attendance:", error);
      }
    };
    fetchFlagged();
  }, []);

  const [search, setSearch] = useState("");
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const filteredFlagged = flagged.filter((record) =>
    record.user?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const itemsPerPage = 16;
  const totalPages = Math.max(
    1,
    Math.ceil(filteredFlagged.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredFlagged.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <>
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">
          Flagged Attendance
        </h2>
      </div>
      <Containers
        name="Flagged Attendance"
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        arrowSize={32}
        searchShow={true}
        totalPages={totalPages}
        search={search}
        setSearch={handleSearch}
      >
        {pageItems.map((record) => (
          <FlaggedItem
            key={record.id}
            name={record.user?.name}
            department={record.user?.department}
            position={record.user?.position}
            location={record.location?.name}
            date={format(new Date(record.date), "MMMM d, yyyy")}
            flagCount={record.flagged_attendances_count}
            excursions={record.flagged_attendances}
            flaggedAt={
              record.flagged_attendances?.[0]?.out_at
                ? format(
                    new Date(record.flagged_attendances[0].out_at),
                    "MMM d, yyyy h:mm a",
                  )
                : "--"
            }
          />
        ))}
      </Containers>
    </>
  );
}
