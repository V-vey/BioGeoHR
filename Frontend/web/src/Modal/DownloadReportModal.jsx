import { useState } from "react";
import { format, parse } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatTime = (timeStr) => {
  if (!timeStr) return "--:--";
  const parsed = parse(timeStr, "HH:mm:ss", new Date());
  return format(parsed, "h:mma"); // "11:00PM"
};

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
export default function DownloadReportModal({ attendance, onClose }) {
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.text("BioGeoHR", 14, 14);
    doc.setFontSize(11);
    doc.text("Attendance Report", 14, 21);
    doc.setFontSize(9);
    doc.text(
      `Period: ${from || "start"} to ${to || "latest"}   |   Department: ${department || "All"}   |   Records: ${matching.length}`,
      14,
      27,
    );

    autoTable(doc, {
      startY: 31,
      head: [header],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [42, 175, 86] }, // your green
    });

    doc.save(
      `attendance-report${from ? `_${from}` : ""}${to ? `_to_${to}` : ""}.pdf`,
    );
    onClose();
  };
  const handleDownload = () => {
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
          included. Choose CSV (opens in Excel) or PDF.
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
            Download CSV
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={matching.length === 0}
            className="px-4 py-1 rounded-full text-white bg-[#6675EC] hover:bg-[#2AAF56] disabled:opacity-40"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
