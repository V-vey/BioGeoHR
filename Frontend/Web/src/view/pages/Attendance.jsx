import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Pagination from "../components/Pagination.jsx";
import { useFilterPanel } from "../../hooks/useFilterPanel.js";

import "../HomePage/Homepage.css";
// Maps an attendance status to a badge style — presentation config,
// not attendance data.
const STATUS_META = {
  "On-time": { cls: "on-time", color: "var(--green)" },
  Late: { cls: "late", color: "var(--yellow)" },
};

export default function Attendance() {
  // TODO: replace with a real API call, e.g.
  //   fetchAttendanceRecords().then(setAttendanceRecords);
  // Expected shape per entry:
  //   { id, name, role, status, date, overtime, clockIn, clockOut, duration, lateTime }
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const { open, setOpen, panelRef, buttonRef } = useFilterPanel();

  useEffect(() => {
    // Data fetching goes here once the backend is connected.
  }, []);

  return (
    <>
      <Sidebar />

      <main className="main">
        <div className="topbar">
          <h2>Attendance</h2>
        </div>

        <div className="card">
          <div className="emp-card-header">
            <h2>Attendance</h2>

            {/* Search bar and filter dropdown trigger */}
            <div className="search-wrap">
              <input
                className="search-box"
                type="text"
                placeholder="Search name or ID"
              />
              <button
                className="filter-btn"
                ref={buttonRef}
                onClick={() => setOpen((o) => !o)}
              >
                ▾
              </button>

              {/* Filter dropdown: status, contract type, department, join date */}
              <div
                className={`filter-panel ${open ? "open" : ""}`}
                ref={panelRef}
              >
                <h4>Status</h4>
                <div className="filter-row">
                  <label>
                    <input type="radio" name="status" /> On-time
                  </label>
                  <label>
                    <input type="radio" name="status" defaultChecked /> Late
                  </label>
                  <label>
                    <input type="radio" name="status" /> Leave
                  </label>
                  <label>
                    <input type="radio" name="status" /> Absent
                  </label>
                </div>

                <h4>Contract Type</h4>
                <div className="filter-row">
                  <label>
                    <input type="checkbox" defaultChecked /> Full-time
                  </label>
                  <label>
                    <input type="checkbox" /> Freelance
                  </label>
                  <label>
                    <input type="checkbox" /> Internship
                  </label>
                </div>

                <h4>Department</h4>
                <div className="filter-row">
                  <label>
                    <input type="checkbox" /> Product
                  </label>
                  <label>
                    <input type="checkbox" defaultChecked /> Engineer
                  </label>
                  <label>
                    <input type="checkbox" /> Marketing
                  </label>
                  <label>
                    <input type="checkbox" /> Finance
                  </label>
                </div>

                <h4>Joined Date</h4>
                <div className="date-row">
                  <select>
                    <option>April 1, 2026</option>
                  </select>
                  <span>-</span>
                  <select>
                    <option>April 5, 2026</option>
                  </select>
                </div>

                <button className="confirm-btn">Confirm</button>
              </div>
            </div>
          </div>

          {/* Daily attendance record cards */}
          <div className="att-grid">
            {attendanceRecords.map((record) => {
              const meta = STATUS_META[record.status];
              return (
                <article className="att-card" key={record.id}>
                  <div className="att-card-top">
                    <div className="att-id">ID - {record.id}</div>
                    <div className="office-badge">Office</div>
                  </div>
                  <div className="att-name-row">
                    <div className="att-name">{record.name}</div>
                    <span className={`att-status ${meta.cls}`}>
                      {record.status}
                      <span
                        className="dot"
                        style={{ background: meta.color }}
                      />
                    </span>
                  </div>
                  <div className="att-role">{record.role}</div>
                  <div className="att-detail-grid">
                    <div>
                      Date: <b>{record.date}</b>
                    </div>
                    <div>
                      Clock-in: <b>{record.clockIn}</b>
                    </div>
                    <div>
                      Overtime: <b>{record.overtime}</b>
                    </div>
                    <div>
                      Clock-out: <b>{record.clockOut}</b>
                    </div>
                    <div>
                      Duration: <b>{record.duration}</b>
                    </div>
                    <div>
                      Late Time: <b>{record.lateTime}</b>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="pagination">
            <span>Page 1</span>
            <Pagination />
          </div>
        </div>
      </main>

      {/* Shortcut to register a new office location */}
      <a className="create-location-btn" href="#">
        Create Location ⊕
      </a>
    </>
  );
}
