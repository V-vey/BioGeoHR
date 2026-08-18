import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Sidebar navigation shared by every page. Highlights the current
 * route and auto-expands whichever submenu (Employee / Attendance)
 * the current page belongs to.
 */
export default function Sidebar() {
    const location = useLocation();
    const isEmployeeRoute = location.pathname.startsWith("/employees");
    const isAttendanceRoute = location.pathname.startsWith("/attendance");

    const [empOpen, setEmpOpen] = useState(isEmployeeRoute);
    const [attOpen, setAttOpen] = useState(isAttendanceRoute);

    return (
        <aside className="sidebar">
            <div className="logo">BioGeoHR</div>

            <nav>
                <Link className={`nav-item ${location.pathname === "/" ? "active" : ""}`} to="/">
                    ▦ Dashboard
                </Link>

                {/* Employee section: expands to show its submenu */}
                <div
                    className={`nav-item nav-parent ${empOpen ? "open" : ""}`}
                    onClick={() => setEmpOpen((open) => !open)}
                >
                    👤 Employee <span className="chev">▾</span>
                </div>
                <div className={`sub-nav ${empOpen ? "open" : ""}`}>
                    <Link className={`sub-item ${isEmployeeRoute ? "active" : ""}`} to="/employees">
                        All Employee
                    </Link>
                    <Link className="sub-item" to="/employees">Leave Request</Link>
                    <Link className="sub-item" to="/employees">New Employee</Link>
                </div>

                {/* Attendance section: expands to show its submenu */}
                <div
                    className={`nav-item nav-parent ${attOpen ? "open" : ""}`}
                    onClick={() => setAttOpen((open) => !open)}
                >
                    📋 Attendance <span className="chev">▾</span>
                </div>
                <div className={`sub-nav ${attOpen ? "open" : ""}`}>
                    <Link className={`sub-item ${isAttendanceRoute ? "active" : ""}`} to="/attendance">
                        Attendance
                    </Link>
                    <Link className="sub-item" to="/attendance">Location</Link>
                </div>

                <a className="nav-item" href="#">💵 Payroll</a>
            </nav>

            <button className="logout">Log-out</button>
        </aside>
    );
}
