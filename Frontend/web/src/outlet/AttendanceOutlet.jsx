import { useEffect, useState } from "react";
import Pagination from "../components/pagincation.jsx";
import { useFilterPanel } from "../hooks/useFilterPanel.js";
import { Link } from "react-router-dom";

// Maps an attendance status to a badge style using Tailwind utility classes
const STATUS_META = {
  "On-time": { textCls: "text-green-500", dotBg: "bg-green-500" },
  Late: { textCls: "text-amber-500", dotBg: "bg-yellow-500" },
};

export default function Attendance() {
  // Expected shape per entry:
  //   { id, name, role, status, date, overtime, clockIn, clockOut, duration, lateTime }
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const { open, setOpen, panelRef, buttonRef } = useFilterPanel();

  useEffect(() => {
    // Data fetching goes here once the backend is connected.
  }, []);

  return (
    <>
      {/* Card Container */}
      <div className="mb-4 p-4 bg-white border border-[#eef0f5] rounded-[14px]">
        <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-[14px]">
          <h2 className="m-0 text-base text-[#6c63ff] font-bold">Attendance</h2>

          {/* Search bar and filter dropdown trigger */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              className="w-full md:w-[220px] p-[7px_12px] border border-[#eef0f5] rounded-[8px] bg-[#fafbfd] text-xs focus:outline-none focus:border-[#6c63ff]"
              type="text"
              placeholder="Search name or ID"
            />
            <button
              ref={buttonRef}
              onClick={() => setOpen((o) => !o)}
              className="w-8 h-8 border border-[#eef0f5] rounded-[8px] bg-white text-[#8a90a3] text-sm cursor-pointer hover:bg-gray-50"
            >
              ▾
            </button>

            {/* Filter dropdown panel */}
            <div
              ref={panelRef}
              className={`absolute top-[42px] right-0 z-10 w-full max-w-[260px] p-4 bg-white border border-[#eef0f5] rounded-[12px] shadow-[0_10px_30px_rgba(20,20,40,0.12)] ${open ? "block" : "hidden"}`}
            >
              <h4 className="m-0 mb-2 text-xs text-[#1f2430] font-bold">
                Status
              </h4>
              <div className="flex flex-col gap-2.5 mb-[14px] text-xs text-[#8a90a3]">
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="accent-[#6c63ff]"
                  />{" "}
                  On-time
                </label>
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    defaultChecked
                    className="accent-[#6c63ff]"
                  />{" "}
                  Late
                </label>
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="accent-[#6c63ff]"
                  />{" "}
                  Leave
                </label>
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="accent-[#6c63ff]"
                  />{" "}
                  Absent
                </label>
              </div>

              <h4 className="m-0 mb-2 text-xs text-[#1f2430] font-bold">
                Contract Type
              </h4>
              <div className="flex flex-col gap-2.5 mb-[14px] text-xs text-[#8a90a3]">
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-[#6c63ff]"
                  />{" "}
                  Full-time
                </label>
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                  Freelance
                </label>
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                  Internship
                </label>
              </div>

              <h4 className="m-0 mb-2 text-xs text-[#1f2430] font-bold">
                Department
              </h4>
              <div className="flex flex-col gap-2.5 mb-[14px] text-xs text-[#8a90a3]">
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input type="checkbox" className="accent-[#6c63ff]" /> Product
                </label>
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-[#6c63ff]"
                  />{" "}
                  Engineer
                </label>
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                  Marketing
                </label>
                <label className="flex items-center gap-[5px] cursor-pointer">
                  <input type="checkbox" className="accent-[#6c63ff]" /> Finance
                </label>
              </div>

              <h4 className="m-0 mb-2 text-xs text-[#1f2430] font-bold">
                Joined Date
              </h4>
              <div className="flex items-center gap-2 mb-[14px]">
                <select className="flex-1 p-[6px] border border-[#eef0f5] rounded-[6px] text-[11px] focus:outline-none">
                  <option>April 1, 2026</option>
                </select>
                <span className="text-gray-400">-</span>
                <select className="flex-1 p-[6px] border border-[#eef0f5] rounded-[6px] text-[11px] focus:outline-none">
                  <option>April 5, 2026</option>
                </select>
              </div>

              <button className="w-full p-2.5 border-none rounded-[8px] bg-[#6c63ff] text-white text-xs font-semibold cursor-pointer hover:bg-opacity-90">
                Confirm
              </button>
            </div>
          </div>
        </div>

        {/* Daily attendance record cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {attendanceRecords.map((record) => {
            const meta = STATUS_META[record.status] || {
              textCls: "text-gray-500",
              dotBg: "bg-gray-400",
            };
            return (
              <article
                className="p-3.5 bg-white border border-[#eef0f5] rounded-[12px]"
                key={record.id}
              >
                <div className="flex justify-between items-start">
                  <div className="text-[11px] text-[#8a90a3]">
                    ID - {record.id}
                  </div>
                  <div className="text-[11px] text-[#8a90a3]">Office</div>
                </div>
                <div className="flex justify-between items-center mt-2.5">
                  <div className="text-sm font-bold text-[#1f2430]">
                    {record.name}
                  </div>
                  <span
                    className={`flex items-center gap-1.25 text-xs font-semibold ${meta.textCls}`}
                  >
                    {record.status}
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${meta.dotBg}`}
                    />
                  </span>
                </div>
                <div className="mb-2.5 text-[11px] text-[#8a90a3]">
                  {record.role}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.25 pt-2.5 border-t border-[#eef0f5] text-[11px] text-[#8a90a3]">
                  <div>
                    Date:{" "}
                    <b className="text-[#1f2430] font-semibold">
                      {record.date}
                    </b>
                  </div>
                  <div>
                    Clock-in:{" "}
                    <b className="text-[#1f2430] font-semibold">
                      {record.clockIn}
                    </b>
                  </div>
                  <div>
                    Overtime:{" "}
                    <b className="text-[#1f2430] font-semibold">
                      {record.overtime}
                    </b>
                  </div>
                  <div>
                    Clock-out:{" "}
                    <b className="text-[#1f2430] font-semibold">
                      {record.clockOut}
                    </b>
                  </div>
                  <div>
                    Duration:{" "}
                    <b className="text-[#1f2430] font-semibold">
                      {record.duration}
                    </b>
                  </div>
                  <div>
                    Late Time:{" "}
                    <b className="text-[#1f2430] font-semibold">
                      {record.lateTime}
                    </b>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center mt-4 text-xs text-[#8a90a3]">
          <span>Page 1</span>
          <Pagination />
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <Link
        className="fixed right-[26px] bottom-[26px] inline-flex items-center gap-2 p-[12px_22px] border-none rounded-[10px] bg-[#22c55e] text-white text-sm font-bold no-underline shadow-[0_8px_20px_rgba(34,197,94,0.35)] cursor-pointer hover:bg-opacity-95"
        to="/location"
      >
        Create Location ⊕
      </Link>
    </>
  );
}
