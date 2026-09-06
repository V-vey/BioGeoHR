import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Sidebar navigation shared by every page. Highlights the current
 * route and auto-expands whichever submenu (Employee / Attendance)
 * the current page belongs to.
 */
export default function Sidebar({ children }) {
  const location = useLocation();
  const isEmployeeRoute = location.pathname.startsWith("/employee");
  const isAttendanceRoute = location.pathname.startsWith("/attendance");

  const [empOpen, setEmpOpen] = useState(isEmployeeRoute);
  const [attOpen, setAttOpen] = useState(isAttendanceRoute);

  return (
    <div>
      <aside className="flex flex-row w-[210px] min-height-screen  bg-white border-r border-[#eef0f5]">
        <div className="mb-7 text-lg font-bold text-[#6c63ff]">BioGeoHR</div>

        <nav>
          <Link
            className={`flex items-center gap-2.5 mb-1 p-2.5 px-3 rounded-lg text-sm font-medium text-decoration-none transition-colors
            ${
              location.pathname === "/"
                ? "bg-[#6c63ff] text-white"
                : "text-[#8a90a3] hover:bg-[#f2f3fb]"
            }`}
            to="/"
          >
            ▦ Dashboard
          </Link>

          {/* Employee section: expands to show its submenu */}
          <div
            className="flex items-center justify-between gap-2.5 mb-1 p-2.5 px-3 rounded-lg text-sm font-medium text-[#8a90a3] hover:bg-[#f2f3fb] cursor-pointer select-none"
            onClick={() => setEmpOpen((open) => !open)}
          >
            <span>👤 Employee</span>
            <span
              className={`text-[11px] transition-transform duration-150 ${empOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </div>

          <div
            className={`flex flex-col mb-1 pl-6.5 ${empOpen ? "flex" : "hidden"}`}
          >
            <Link
              className={`mb-0.5 p-1.5 px-2 rounded-md text-xs text-decoration-none hover:bg-[#f2f3fb] hover:text-[#6c63ff] transition-colors
              ${isEmployeeRoute ? "text-[#6c63ff] font-semibold" : "text-[#8a90a3]"}`}
              to="/employee"
            >
              All Employee
            </Link>
            <Link
              className="mb-0.5 p-1.5 px-2 rounded-md text-xs text-decoration-none text-[#8a90a3] hover:bg-[#f2f3fb] hover:text-[#6c63ff] transition-colors"
              to="/employee"
            >
              Leave Request
            </Link>
            <Link
              className="mb-0.5 p-1.5 px-2 rounded-md text-xs text-decoration-none text-[#8a90a3] hover:bg-[#f2f3fb] hover:text-[#6c63ff] transition-colors"
              to="/employee"
            >
              New Employee
            </Link>
          </div>

          {/* Attendance section: expands to show its submenu */}
          <div
            className="flex items-center justify-between gap-2.5 mb-1 p-2.5 px-3 rounded-lg text-sm font-medium text-[#8a90a3] hover:bg-[#f2f3fb] cursor-pointer select-none"
            onClick={() => setAttOpen((open) => !open)}
          >
            <span>📋 Attendance</span>
            <span
              className={`text-[11px] transition-transform duration-150 ${attOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </div>

          <div
            className={`flex flex-col mb-1 pl-6.5 ${attOpen ? "flex" : "hidden"}`}
          >
            <Link
              className={`mb-0.5 p-1.5 px-2 rounded-md text-xs text-decoration-none hover:bg-[#f2f3fb] hover:text-[#6c63ff] transition-colors
              ${isAttendanceRoute ? "text-[#6c63ff] font-semibold" : "text-[#8a90a3]"}`}
              to="/attendance"
            >
              Attendance
            </Link>
            <Link
              className="mb-0.5 p-1.5 px-2 rounded-md text-xs text-decoration-none text-[#8a90a3] hover:bg-[#f2f3fb] hover:text-[#6c63ff] transition-colors"
              to="/attendance"
            >
              Location
            </Link>
          </div>

          <a
            className="flex items-center gap-2.5 mb-1 p-2.5 px-3 rounded-lg text-sm font-medium text-decoration-none text-[#8a90a3] hover:bg-[#f2f3fb] transition-colors"
            href="#"
          >
            💵 Payroll
          </a>
        </nav>

        <button className="mt-auto p-2.5 border-none rounded-lg bg-[#6c63ff] text-white font-semibold cursor-pointer hover:bg-[#5b52ee] transition-colors">
          Log-out
        </button>
      </aside>
      {children}
    </div>
  );
}
