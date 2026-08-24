import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Pagination from "../components/Pagination.jsx";
import { useFilterPanel } from "../../hooks/useFilterPanel.js";

import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card/index.jsx";

import "../HomePage/Homepage.css";
// Maps an employee's availability status to a badge style —
// presentation config, not employee data.
const STATUS_META = {
  Available: { cls: "available", color: "var(--green)" },
  Unavailable: { cls: "unavailable", color: "var(--red)" },
  Break: { cls: "break", color: "var(--yellow)" },
  Leave: { cls: "leave", color: "var(--blue)" },
};

export default function AllEmployees() {
  // TODO: replace with a real API call, e.g.
  //   fetchEmployees().then(setEmployees);
  // Expected shape per entry:
  //   { id, name, email, dept, role, contract, join, status }
  const [employees, setEmployees] = useState([]);
  const { open, setOpen, panelRef, buttonRef } = useFilterPanel();

  useEffect(() => {
    // Data fetching goes here once the backend is connected.
  }, []);

  return (
    <>
      <Sidebar />

      <main className="main">
        <div className="topbar">
          <h2>Location</h2>
        </div>
        <div className="card">
          {/* map */}
          <Card className="h-[550px] w-full border shadow-sm rounded-xl overflow-hidden bg-slate-50">
            <div className="h-[320px] p-0 overflow-hidden">
              <Map center={[-74.006, 40.7128]} zoom={11}>
                <MapControls />
              </Map>
            </div>
          </Card>
          <div className="card">
            <input
              type="text"
              placeholder="Location Name"
              name="name"
              id="name"
            />
            <br />
            <input
              type="number"
              placeholder="Latitude"
              name="latitude"
              id="latitude"
            />
            <input
              type="number"
              placeholder="Longitude"
              name="longitude"
              id="longitude"
            />
            <br />
            <input type="range" />
            <button>Confirm</button>
          </div>
        </div>
        <div className="card">
          <div className="emp-card-header">
            <h2>Recent Attendance</h2>

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

              {/* Filter dropdown: availability, contract type, department, join date */}
              <div
                className={`filter-panel ${open ? "open" : ""}`}
                ref={panelRef}
              >
                <h4>Availability</h4>
                <div className="filter-row">
                  <label>
                    <input type="checkbox" defaultChecked /> Available
                  </label>
                  <label>
                    <input type="checkbox" /> Unavailable
                  </label>
                  <label>
                    <input type="checkbox" /> Break
                  </label>
                  <label>
                    <input type="checkbox" /> Leave
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
                    <input type="checkbox" /> Engineer
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

          {/* Employee record cards */}
          <div className="emp-grid">
            {employees.map((employee) => {
              const meta = STATUS_META[employee.status];
              return (
                <article className="emp-card" key={employee.id}>
                  <div className="emp-card-top">
                    <div className="emp-id">ID - {employee.id}</div>
                    <div>
                      <Link
                        className="view-btn"
                        to={`/employees/${employee.id}`}
                      >
                        View
                      </Link>
                      <div className={`emp-status ${meta.cls}`}>
                        {employee.status}
                        <span
                          className="dot"
                          style={{ background: meta.color }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="emp-body">
                    <div className="emp-avatar"></div>
                    <div>
                      <div className="emp-name">{employee.name}</div>
                      <div className="emp-email">{employee.email}</div>
                      <div className="emp-role">
                        {employee.dept} | {employee.role}
                      </div>
                    </div>
                  </div>
                  <div className="emp-foot">
                    <div>
                      Contract Type:<b>{employee.contract}</b>
                    </div>
                    <div>
                      Join Date:<b>{employee.join}</b>
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
    </>
  );
}
