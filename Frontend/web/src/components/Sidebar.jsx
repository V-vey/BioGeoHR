import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/**
 * Sidebar navigation shared by every page. Highlights the current
 * route and auto-expands whichever submenu (Employee / Attendance)
 * the current page belongs to.
 */

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isEmployeeRoute = location.pathname.startsWith("/employees");
  const isAttendanceRoute = location.pathname.startsWith("/attendance");

  const [empOpen, setEmpOpen] = useState(isEmployeeRoute);
  const [attOpen, setAttOpen] = useState(isAttendanceRoute);
  const handleLogout = () => {
    navigate("/", { replace: true });
  };
  return (
    <aside className="sidebar">
      {/* <div className="logo">BioGeoHR</div> */}

      <nav>
        <a
          className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
          to="/dashboard"
        >
          ▦ Dashboard
        </a>

        {/* Employee section: expands to show its submenu */}
        <div
          className={`nav-item nav-parent ${empOpen ? "open" : ""}`}
          onClick={() => setEmpOpen((open) => !open)}
        >
          👤 Employee <span className="chev">▾</span>
        </div>
        <div className={`sub-nav ${empOpen ? "open" : ""}`}>
          <Link
            className={`sub-item ${isEmployeeRoute ? "active" : ""}`}
            to="/employees"
          >
            All Employee
          </Link>
          <a className="sub-item" to="/leaveRequest">
            Leave Request
          </a>
          <a className="sub-item" to="/newEmployee">
            New Employee
          </a>
        </div>

        {/* Attendance section: expands to show its submenu */}
        <div
          className={`nav-item nav-parent ${attOpen ? "open" : ""}`}
          onClick={() => setAttOpen((open) => !open)}
        >
          📋 Attendance <span className="chev">▾</span>
        </div>
        <div className={`sub-nav ${attOpen ? "open" : ""}`}>
          <Link
            className={`sub-item ${isAttendanceRoute ? "active" : ""}`}
            to="/attendance"
          >
            Attendance
          </Link>
          <Link className="sub-item" to="/location">
            Location
          </Link>
        </div>

        <a className="nav-item" href="#">
          💵 Payroll
        </a>
      </nav>

      <button className="logout" onClick={handleLogout}>
        Log-out
      </button>
    </aside>
  );
}
