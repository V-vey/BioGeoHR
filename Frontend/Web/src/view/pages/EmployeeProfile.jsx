import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Pagination from "../components/Pagination.jsx";

// TODO: replace with a real API call keyed by the employee id, e.g.
//   fetchEmployeeProfile(id).then(setEmployee);
// Expected shape — see the JSX below for every field this page reads:
//   {
//     id, firstName, lastName, middleName, name, email,
//     dept, role, contract, join, status,
//     gender, birthDate, age, contact, education, degree,
//     birthPlace, address, nationality, maritalStatus,
//     monthlySalary, dailyWage, hourlyRate, standardHours, salaryPerHour,
//     leaveBalances: { annual, sick, paternity, unpaid },
//     attendance: { onTimeDays, lateDuration },
//     recentLeave: [{ status, type, start, end, days }, ...],
//   }
const PROFILES = {};

// Maps a leave request's status to a badge style — presentation
// config, not leave data.
const LEAVE_BADGE_META = {
  Pending: { cls: "pending", color: "var(--yellow)" },
  Rejected: { cls: "rejected", color: "var(--red)" },
  Approved: { cls: "approved", color: "var(--green)" },
};

// Fields shown on the Personal Info tab. Kept as a small config
// array so the form is built the same way it's rendered.
function buildPersonalInfoFields(employee) {
  return [
    { label: "Last name*", value: employee.lastName, type: "text" },
    { label: "First name*", value: employee.firstName, type: "text" },
    { label: "Middle name", value: employee.middleName, type: "text" },
    {
      label: "Gender*",
      value: employee.gender,
      type: "select",
      options: ["Male", "Female"],
    },
    { label: "Birth place", value: employee.birthPlace, type: "text" },
    { label: "Address*", value: employee.address, type: "text" },
    { label: "Nationality*", value: employee.nationality, type: "text" },
    {
      label: "Status*",
      value: employee.maritalStatus,
      type: "select",
      options: ["Single", "Married"],
    },
    { label: "Date of Birth*", value: employee.birthDate, type: "text" },
    { label: "Education*", value: employee.education, type: "text" },
    { label: "Degree*", value: employee.degree, type: "text" },
    { label: "Monthly Salary*", value: employee.monthlySalary, type: "text" },
    {
      label: "Standard Work Hours per Day",
      value: employee.standardHours,
      type: "text",
    },
  ];
}

/** A single labeled input or select on the Personal Info form. */
function PersonalInfoField({ field }) {
  return (
    <div className="pi-field">
      <label>{field.label}</label>
      {field.type === "select" ? (
        <select defaultValue={field.value}>
          {field.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input type="text" defaultValue={field.value} />
      )}
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  // TODO: replace with a real API call, e.g.
  //   fetchEmployeeProfile(id).then(setEmployee);
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // No matching profile yet (e.g. the backend isn't connected,
    // or an unknown id was passed) — leave employee as null
    // rather than rendering with missing data.
    setEmployee(PROFILES[id] || null);
  }, [id]);

  return (
    <>
      <Sidebar />

      <main className="main">
        <div className="profile-topbar">
          <Link className="back-btn" to="/employees">
            ⏎ Back
          </Link>
          <h1>Employees Profile</h1>
        </div>

        {/* Tab switcher between Overview and Personal Info */}
        <div className="profile-tabs">
          <span
            className={`profile-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </span>
          <span
            className={`profile-tab ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Info
          </span>
        </div>

        {employee && (
          <>
            {/* Overview tab: leave balances, attendance/salary summary, recent leave, profile card */}
            <div
              className={`profile-grid ${activeTab !== "overview" ? "is-hidden" : ""}`}
            >
              <div>
                {/* Leave balance pills (Annual, Sick, Paternity, Unpaid) */}
                <div className="leave-pill-row">
                  <div className="leave-pill">
                    <span>Annual Leave</span>
                    <span className="count">
                      {employee.leaveBalances.annual}
                    </span>
                  </div>
                  <div className="leave-pill">
                    <span>Sick Leave</span>
                    <span className="count">{employee.leaveBalances.sick}</span>
                  </div>
                  <div className="leave-pill">
                    <span>Paternity Leave</span>
                    <span className="count">
                      {employee.leaveBalances.paternity}
                    </span>
                  </div>
                  <div className="leave-pill">
                    <span>Unpaid Leave</span>
                    <span className="count">
                      {employee.leaveBalances.unpaid}
                    </span>
                  </div>
                </div>

                <div className="two-col">
                  {/* Attendance summary for the current period */}
                  <div className="card">
                    <div className="info-box-header">
                      <h2>Attendance</h2>
                      <button className="dots-btn">⋯</button>
                    </div>
                    <div className="stat-line">
                      <div className="stat-icon">🕐</div>
                      <div>
                        <div className="stat-line-label">On-time</div>
                        <div className="stat-line-sub">
                          {employee.attendance.onTimeDays} days Attended
                        </div>
                      </div>
                    </div>
                    <div className="stat-line">
                      <div className="stat-icon">🕐</div>
                      <div>
                        <div className="stat-line-label">Late</div>
                        <div className="stat-line-sub">
                          {employee.attendance.lateDuration} Lateness
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hourly salary summary */}
                  <div className="card">
                    <div className="info-box-header">
                      <h2>Salary</h2>
                      <button className="dots-btn">⋯</button>
                    </div>
                    <div className="stat-line">
                      <div className="stat-icon">💲</div>
                      <div>
                        <div className="stat-line-label">Salary Per Hours</div>
                        <div className="stat-line-sub">
                          ₱{employee.salaryPerHour} Per hours
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent leave request cards */}
                <div className="card">
                  <div className="info-box-header">
                    <h2>Recent Leave</h2>
                    <button className="dots-btn">⋯</button>
                  </div>
                  <div className="leave-grid">
                    {employee.recentLeave.map((leave, index) => {
                      const meta = LEAVE_BADGE_META[leave.status];
                      return (
                        <article className="leave-card" key={index}>
                          <div className="leave-card-top">
                            <span className={`leave-badge ${meta.cls}`}>
                              {leave.status}
                              <span
                                className="dot"
                                style={{ background: meta.color }}
                              />
                            </span>
                            <a className="view-btn" href="#">
                              View
                            </a>
                          </div>
                          <div className="leave-detail">
                            <span>Type of Leave:</span>
                            <b>{leave.type}</b>
                          </div>
                          <div className="leave-detail">
                            <span>Starting Date:</span>
                            <b>{leave.start}</b>
                          </div>
                          <div className="leave-detail">
                            <span>Ending Date:</span>
                            <b>{leave.end}</b>
                          </div>
                          <div className="leave-detail">
                            <span>Number of Days:</span>
                            <b>{leave.days}</b>
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
              </div>

              {/* Right-hand profile summary card */}
              <div className="card profile-card">
                <div className="profile-status">
                  {employee.status}
                  <span
                    className="dot"
                    style={{ background: "var(--green)", marginLeft: "4px" }}
                  />
                </div>
                <div className="profile-avatar-lg"></div>
                <div className="profile-name">{employee.name}</div>
                <div className="profile-email">{employee.email}</div>

                <div className="profile-row">
                  <span>Employee ID</span>
                  <span>{employee.id}</span>
                </div>
                <div className="profile-row">
                  <span>Join Date</span>
                  <span>{employee.join}</span>
                </div>
                <div className="profile-row">
                  <span>Department</span>
                  <span>{employee.dept}</span>
                </div>
                <div className="profile-row">
                  <span>Role</span>
                  <span>{employee.role}</span>
                </div>
                <div className="profile-row">
                  <span>Contract Type</span>
                  <span>{employee.contract}</span>
                </div>

                <div className="profile-subhead">Personal Information</div>
                <div className="profile-row">
                  <span>Gender</span>
                  <span>{employee.gender}</span>
                </div>
                <div className="profile-row">
                  <span>Birth Date</span>
                  <span>{employee.birthDate}</span>
                </div>
                <div className="profile-row">
                  <span>Age</span>
                  <span>{employee.age}</span>
                </div>
                <div className="profile-row">
                  <span>Contact No.</span>
                  <span>{employee.contact}</span>
                </div>
                <div className="profile-row">
                  <span>Education</span>
                  <span>{employee.education}</span>
                </div>
                <div className="profile-row">
                  <span>Degree</span>
                  <span>{employee.degree}</span>
                </div>

                <button
                  className="view-more-btn"
                  onClick={() => setActiveTab("personal")}
                >
                  View More
                </button>
              </div>
            </div>

            {/* Personal Info tab: editable employee record form */}
            <div
              className={`profile-grid ${activeTab !== "personal" ? "is-hidden" : ""}`}
            >
              <div className="card pi-header-card">
                <div className="profile-avatar-lg"></div>
                <div className="pi-header-meta">
                  <div className="name-line">
                    [{employee.id}] {employee.name} - {employee.dept} |{" "}
                    {employee.role}
                  </div>
                  <div className="pi-salary-row">
                    <div>
                      Monthly Salary:<b>{employee.monthlySalary}</b>
                    </div>
                    <div>
                      Daily Wage:<b>{employee.dailyWage}</b>
                    </div>
                    <div>
                      Hourly Rate:<b>{employee.hourlyRate}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="pi-form-header">
                  <h2>Personal Information</h2>
                  <span>▾</span>
                </div>
                <div className="pi-form-grid">
                  {buildPersonalInfoFields(employee).map((field) => (
                    <PersonalInfoField field={field} key={field.label} />
                  ))}
                </div>
                <div className="pi-form-actions">
                  <button className="pi-btn refresh">↻ Refresh</button>
                  <button className="pi-btn save">💾 Save</button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
