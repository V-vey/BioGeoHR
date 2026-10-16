import { useEffect, useState } from "react";
import Containers from "../components/container.jsx";
import Item from "@/components/Attendance/item-container.jsx";
import { Download } from "lucide-react";

import { url } from "@/resources/api";
import { useDataChanged } from "@/lib/dataChanged";
import axios from "axios";

import { format, parse, differenceInMinutes } from "date-fns";
import Loading from "@/components/Loading";

import DownloadReportModal from "@/Modal/DownloadReportModal.jsx";
import CreateAttendanceModal from "@/Modal/CreateAttendanceModal.jsx";
const formatTime = (timeStr) => {
  if (!timeStr) return "--:--";
  const parsed = parse(timeStr, "HH:mm:ss", new Date());
  return format(parsed, "h:mma"); // "11:00PM"
};

const formatHours = (timeIn, timeOut) => {
  if (!timeIn || !timeOut) return "--"; // not clocked out yet, or absent
  const start = parse(timeIn, "HH:mm:ss", new Date());
  const end = parse(timeOut, "HH:mm:ss", new Date());
  const minutes = differenceInMinutes(end, start);
  if (minutes < 0) return "--"; // clock-out earlier than clock-in
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
};

// A day can have several clock-ins (the employee clocks in again after clocking out). The server
// adds the sessions up, so the hours are what was really worked, not first in to last out.
const formatWorked = (att) => {
  if (att.workedSeconds > 0) {
    const minutes = Math.floor(att.workedSeconds / 60);
    return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
  }
  return formatHours(att.clockIn, att.clockOut);
};

const ITEMS_PER_PAGE = 16;

// Searching, filtering and paging are done by the server (one page at a time), so this
// page stays fast however many attendance records there are.
export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);

  const [rows, setRows] = useState([]); // the records of the current page only
  const [total, setTotal] = useState(0); // how many records match the search and filters
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState([]); // for the filter panel
  const [loading, setLoading] = useState(true); // the first load
  const [reload, setReload] = useState(0); // bump it to ask the server again
  useDataChanged(["attendance"], () => setReload((n) => n + 1)); // new clock-ins appear by themselves
  const [showDownload, setShowDownload] = useState(false);
  const [showCreateAttendance, setShowCreateAttendnace] = useState(false);

  const [search, setSearch] = useState("");
  const [searchSent, setSearchSent] = useState(""); // the search the server was last asked for

  // wait for a pause in typing before asking the server, and start again at page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchSent(search.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // what the filter panel last applied
  const [filters, setFilters] = useState({
    status: "All",
    department: "All",
    dates: { from: "", to: "" },
  });
  const handleFilterApply = (applied) => {
    setFilters(applied);
    setCurrentPage(1);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchPage = async () => {
      try {
        const params = { page: currentPage, per_page: ITEMS_PER_PAGE };
        if (searchSent) params.search = searchSent;
        if (filters.status !== "All") params.status = filters.status;
        if (filters.department !== "All")
          params.department = filters.department;
        if (filters.dates.from) params.date_from = filters.dates.from;
        if (filters.dates.to) params.date_to = filters.dates.to;

        const response = await axios.get(url + "/attendance", {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (cancelled) return; // a newer request has replaced this one
        const page = response.data;
        setRows(page.data);
        setTotal(page.total);
        setTotalPages(Math.max(1, page.last_page));
        setDepartments(page.departments ?? []);
        // the page we asked for no longer exists (for example after a filter): go to the last one
        if (
          page.data.length === 0 &&
          page.total > 0 &&
          currentPage > page.last_page
        )
          setCurrentPage(page.last_page);
      } catch (error) {
        console.error("Failed to load attendance:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [currentPage, searchSent, filters, reload]);

  const filterConfig = [
    {
      key: "status",
      label: "Status",
      type: "radio",
      options: ["All", "On-Time", "Late", "Absent"],
    },
    {
      key: "department",
      label: "Department",
      type: "radio",
      options: ["All", ...departments],
    },
    { key: "dates", label: "Date", type: "dateRange" },
  ];

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
          filterConfig={filterConfig}
          onFilterApply={handleFilterApply}
          totalPages={totalPages}
          total={total}
          search={search}
          setSearch={setSearch}
        >
          {rows.map((att, i) => (
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
              hours={formatWorked(att)}
              session={att.sessions}
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
          departments={departments}
          onClose={() => setShowDownload(false)}
        />
      )}
      {showCreateAttendance && (
        <CreateAttendanceModal
          onSaved={() => setReload((n) => n + 1)}
          onClose={() => setShowCreateAttendnace(false)}
        />
      )}
    </>
  );
}
