import { useEffect, useState } from "react";
import Containers from "../components/container.jsx";
import Item from "@/components/Attendance/item-container.jsx";
import { useFilterPanel } from "../hooks/useFilterPanel.js";
import { Download } from "lucide-react";

import { url } from "@/resources/api";
import axios from "axios";

import { format, parse } from "date-fns";
import Loading from "@/components/Loading";

import DownloadReportModal from "@/Modal/DownloadReportModal.jsx";
import CreateAttendanceModal from "@/Modal/CreateAttendanceModal.jsx";

const formatTime = (timeStr) => {
  if (!timeStr) return "--:--";
  const parsed = parse(timeStr, "HH:mm:ss", new Date());
  return format(parsed, "h:mma"); // "11:00PM"
};
export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDownload, setShowDownload] = useState(false);
  const [showCreateAttendance, setShowCreateAttendnace] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      {loading && <Loading />}
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">Attendance</h2>
      </div>
      {/* Card Container */}
      <div className="flex flex-col gap-4">
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
        <div className="flex flex-row gap-2 justify-end">
          <button
            type="button"
            className="flex flex-row gap-2 bg-[#6675EC] items-center
          justify-center rounded-[10px] px-4 py-1 text-white border
          border-[#b2b2b2] hover:bg-[#6675EC]/90"
            onClick={() => setShowDownload(true)}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            type="button"
            className="flex flex-row gap-2 bg-[#2AAF56] items-center
          justify-center rounded-[10px] px-4 py-1 text-white border
          border-[#b2b2b2] hover:bg-[#2AAF56]/90"
            onClick={() => setShowCreateAttendnace(true)}
          >
            Create Attendance
          </button>
        </div>
      </div>
      {showDownload && (
        <DownloadReportModal
          attendance={attendance}
          onClose={() => setShowDownload(false)}
        />
      )}
      {showCreateAttendance && (
        <CreateAttendanceModal
          onSaved={fetchAttendance}
          onClose={() => setShowCreateAttendnace(false)}
        />
      )}
    </>
  );
}
