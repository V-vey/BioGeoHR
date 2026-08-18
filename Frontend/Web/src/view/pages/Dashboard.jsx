import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";

// Presentation details for each stat card (label, icon, color).
// UI configuration, not employee data — stays static. Only the
// numeric values underneath (see dashboardStats below) are dynamic.
const STAT_CARD_CONFIG = [
    { key: "totalEmployees", label: "Total Employee", icon: "👥", color: "#eef0ff" },
    { key: "attendanceRate", label: "Attendance Number", icon: "⏱", color: "#e9f9ee" },
    { key: "lateEmployees", label: "Late Employee", icon: "⏰", color: "#fff6e6" },
    { key: "absentEmployees", label: "Absent Employee", icon: "⚠", color: "#fdecec" },
    { key: "onLeaveEmployees", label: "Leave Employee", icon: "🚶", color: "#e9f0ff" },
];

const CHART_MAX_TOTAL = 1500;
const CHART_HEIGHT_PX = 200;

// Maps an attendance status to the dot color shown next to it in
// the summary table — presentation config, not employee data.
const ATTENDANCE_STATUS_COLOR = {
    "On-time": "var(--green)",
    "Late": "var(--yellow)",
    "Absent": "var(--red)",
    "Leave": "var(--blue)",
};

// Maps a leave type to its badge color — presentation config.
const LEAVE_TYPE_COLOR = {
    "Sick Leave": "var(--green)",
    "Paternity Leave": "var(--green)",
    "Unpaid Leave": "var(--red)",
    "Annual Leave": "var(--blue)",
};

/**
 * Builds a real calendar for the current month (weekday headers,
 * muted leading days from the previous month, and today's date
 * highlighted) using the browser's own clock.
 */
function useCalendarDays() {
    return useMemo(() => {
        const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
        const daysInPreviousMonth = new Date(year, month, 0).getDate();
        const firstWeekdayOfMonth = new Date(year, month, 1).getDay();

        const leadingDays = Array.from(
            { length: firstWeekdayOfMonth },
            (_, i) => daysInPreviousMonth - firstWeekdayOfMonth + 1 + i
        );
        const monthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

        return { weekdayLabels: WEEKDAY_LABELS, leadingDays, monthDays, todayDate: today.getDate() };
    }, []);
}

export default function Dashboard() {
    // TODO: replace these with real API calls, e.g.
    //   fetchDashboardStats().then(setDashboardStats);
    //   fetchWeeklyAttendance().then(setWeeklyAttendance);
    //   fetchEmployeeSummary().then(setEmployeeSummary);
    //   fetchPendingLeaveRequests().then(setLeaveRequests);
    const [dashboardStats, setDashboardStats] = useState({});
    // Expected shape per entry: { day, onTime, late, absent, leave }
    const [weeklyAttendance, setWeeklyAttendance] = useState([]);
    // Expected shape per entry: { name, dept, role, status, contract }
    const [employeeSummary, setEmployeeSummary] = useState([]);
    // Expected shape per entry: { name, email, type }
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        // Data fetching goes here once the backend is connected.
    }, []);

    const { weekdayLabels, leadingDays, monthDays, todayDate } = useCalendarDays();
    const chartScale = CHART_HEIGHT_PX / CHART_MAX_TOTAL;

    return (
        <>
            <Sidebar />

            <main className="main">
                <h1 className="title">Dashboard</h1>

                {/* Summary metric cards (total employees, attendance rate, etc.) */}
                <div className="stat-row">
                    {STAT_CARD_CONFIG.map((stat) => {
                        const data = dashboardStats[stat.key];
                        return (
                            <div className="stat-card" key={stat.key}>
                                <div className="stat-icon" style={{ background: stat.color }}>{stat.icon}</div>
                                <div>
                                    <div className="stat-label">{stat.label}</div>
                                    <div className="stat-value">{data?.value ?? "—"}</div>
                                    {data?.sub && <div className="stat-sub">{data.sub}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid">
                    <div>
                        {/* Weekly attendance breakdown chart */}
                        <div className="card">
                            <h2>Weekly Attendance</h2>
                            <div className="chart">
                                {weeklyAttendance.map((day) => {
                                    const total = day.onTime + day.late + day.absent + day.leave;
                                    return (
                                        <div className="bar-col" key={day.day}>
                                            <div className="bar-stack" style={{ height: `${total * chartScale}px` }}>
                                                <div style={{ height: `${day.leave * chartScale}px`, background: "var(--blue)" }} />
                                                <div style={{ height: `${day.absent * chartScale}px`, background: "var(--red)" }} />
                                                <div style={{ height: `${day.late * chartScale}px`, background: "var(--yellow)" }} />
                                                <div style={{ height: `${day.onTime * chartScale}px`, background: "var(--green)" }} />
                                            </div>
                                            <span>{day.day.slice(0, 3)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="legend">
                                <span><i className="on-time"></i>On-Time</span>
                                <span><i className="late"></i>Late</span>
                                <span><i className="absent"></i>Absent</span>
                                <span><i className="leave"></i>Leave</span>
                            </div>
                        </div>

                        {/* Employee summary table */}
                        <div className="card">
                            <h2>List of Employee</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Department</th>
                                        <th>Role</th>
                                        <th>Attendance</th>
                                        <th>Contract Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeSummary.map((employee, index) => (
                                        <tr key={index}>
                                            <td>{employee.name}</td>
                                            <td>{employee.dept}</td>
                                            <td>{employee.role}</td>
                                            <td>
                                                <span className="dot" style={{ background: ATTENDANCE_STATUS_COLOR[employee.status] }} />
                                                {employee.status}
                                            </td>
                                            <td>{employee.contract}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        {/* Current month calendar */}
                        <div className="card">
                            <h2>Calendar</h2>
                            <div className="cal-grid">
                                {weekdayLabels.map((label) => (
                                    <div className="dow" key={label}>{label}</div>
                                ))}
                                {leadingDays.map((day, index) => (
                                    <div className="day muted" key={`lead-${index}`}>{day}</div>
                                ))}
                                {monthDays.map((day) => (
                                    <div className={`day ${day === todayDate ? "today" : ""}`} key={day}>{day}</div>
                                ))}
                            </div>
                        </div>

                        {/* Pending leave requests */}
                        <div className="card">
                            <h2>Leave Request</h2>
                            <div>
                                {leaveRequests.map((leave, index) => (
                                    <div className="leave-item" key={index}>
                                        <div className="avatar"></div>
                                        <div>
                                            <div className="leave-name">{leave.name}</div>
                                            <div className="leave-email">{leave.email}</div>
                                        </div>
                                        <span className="tag" style={{ background: LEAVE_TYPE_COLOR[leave.type] }}>{leave.type}</span>
                                        <button className="btn-view">View</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
