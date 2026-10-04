import { useEffect, useState } from "react";
import Containers from "../components/container.jsx";
import Item from "@/components/Attendance/item-container.jsx";
import { useFilterPanel } from "../hooks/useFilterPanel.js";
import { Download } from "lucide-react";

import { url } from "@/resources/api";
import axios from "axios";

import { format, parse } from "date-fns";
import Loading from "@/components/Loading";

const formatTime = (timeStr) => {
  if (!timeStr) return "--:--";
  const parsed = parse(timeStr, "HH:mm:ss", new Date());
  return format(parsed, "h:mma"); // "11:00PM"
};

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function DownloadReportModal({ attendance, onClose }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [department, setDepartment] = useState("");

  const departments = [
    ...new Set(attendance.map((a) => a.department).filter(Boolean)),
  ].sort();

  const matching = attendance.filter((a) => {
    const day = String(a.date).slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (department && a.department !== department) return false;
    return true;
  });

  const handleDownload = () => {
    const header = [
      "Date",
      "Name",
      "Department",
      "Position",
      "Location",
      "Status",
      "Clock In",
      "Clock Out",
    ];
    const rows = matching.map((a) => [
      String(a.date).slice(0, 10),
      a.name,
      a.department,
      a.position,
      a.location,
      a.status,
      a.clockIn ? formatTime(a.clockIn) : "",
      a.clockOut ? formatTime(a.clockOut) : "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n");

    // the leading BOM makes Excel read the file as UTF-8
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance-report${from ? `_${from}` : ""}${to ? `_to_${to}` : ""}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    onClose();
  };

  const fieldClass =
    "w-full border border-[#b2b2b2] rounded-[10px] p-2 bg-white";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
      <div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="font-bold text-left">Download attendance report</h2>

        <div className="flex flex-row gap-2">
          <label className="flex-1 text-left text-sm font-medium">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex-1 text-left text-sm font-medium">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>

        <label className="text-left text-sm font-medium">
          Department
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={fieldClass}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        <p className="text-xs text-[#8a90a3] text-left">
          {matching.length} record{matching.length === 1 ? "" : "s"} will be
          included. The file is a CSV that opens in Excel.
        </p>

        <div className="flex flex-row gap-2 justify-end mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded-full border border-[#b2b2b2]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={matching.length === 0}
            className="px-4 py-1 rounded-full text-white bg-[#2AAF56] hover:bg-[#6675EC] disabled:opacity-40"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Attendance() {
  const [currentPage, setCurrentPage] = useState(1);

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDownload, setShowDownload] = useState(false);

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
      } finally {
        setLoading(false);
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
      {loading && <Loading />}
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
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

      <button
        type="button"
        onClick={() => setShowDownload(true)}
        className="fixed right-[26px] bottom-[26px] inline-flex items-center gap-2 p-[12px_22px] border-none rounded-[10px] bg-[#22c55e] text-white text-sm font-bold shadow-[0_8px_20px_rgba(34,197,94,0.35)] cursor-pointer hover:bg-opacity-95"
      >
        <Download className="w-4 h-4" />
        Download
      </button>

      {showDownload && (
        <DownloadReportModal
          attendance={attendance}
          onClose={() => setShowDownload(false)}
        />
      )}
    </>
  );
}
