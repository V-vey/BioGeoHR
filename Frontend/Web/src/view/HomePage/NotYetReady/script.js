/**
 * script.js — Dashboard page
 *
 * Renders the stat cards, weekly attendance chart, calendar,
 * employee summary table, and leave request list. Sidebar toggles
 * and pagination live in common.js.
 *
 * The arrays/objects below (dashboardStats, weeklyAttendance,
 * employeeSummary, leaveRequests) are placeholders for data that
 * should come from the backend. Each render function already knows
 * how to draw the UI from that shape — once an API is wired up,
 * replace the placeholder assignment with the real fetch call and
 * the rest of this file keeps working unchanged.
 */

(function () {
    // Presentation details for each stat card (label, icon, color).
    // These are UI configuration, not employee data, so they stay
    // static — only the numeric values underneath are dynamic.
    const STAT_CARD_CONFIG = [
        { key: "totalEmployees", label: "Total Employee", icon: "👥", color: "#eef0ff" },
        { key: "attendanceRate", label: "Attendance Number", icon: "⏱", color: "#e9f9ee" },
        { key: "lateEmployees", label: "Late Employee", icon: "⏰", color: "#fff6e6" },
        { key: "absentEmployees", label: "Absent Employee", icon: "⚠", color: "#fdecec" },
        { key: "onLeaveEmployees", label: "Leave Employee", icon: "🚶", color: "#e9f0ff" },
    ];

    // TODO: replace with a real API call, e.g.
    //   const dashboardStats = await fetchDashboardStats();
    const dashboardStats = {};

    // TODO: replace with a real API call, e.g.
    //   const weeklyAttendance = await fetchWeeklyAttendance();
    // Expected shape per entry: { day, onTime, late, absent, leave }
    const weeklyAttendance = [];
    const CHART_MAX_TOTAL = 1500;
    const CHART_HEIGHT_PX = 200;

    // TODO: replace with a real API call, e.g.
    //   const employeeSummary = await fetchEmployeeSummary();
    // Expected shape per entry: { name, dept, role, status, contract }
    const employeeSummary = [];

    // Maps an attendance status to the dot color shown next to it
    // in the summary table — presentation config, not employee data.
    const ATTENDANCE_STATUS_COLOR = {
        "On-time": "var(--green)",
        "Late": "var(--yellow)",
        "Absent": "var(--red)",
        "Leave": "var(--blue)",
    };

    // TODO: replace with a real API call, e.g.
    //   const leaveRequests = await fetchPendingLeaveRequests();
    // Expected shape per entry: { name, email, type }
    const leaveRequests = [];

    // Maps a leave type to its badge color — presentation config.
    const LEAVE_TYPE_COLOR = {
        "Sick Leave": "var(--green)",
        "Paternity Leave": "var(--green)",
        "Unpaid Leave": "var(--red)",
        "Annual Leave": "var(--blue)",
    };

    /** Renders the row of summary metric cards at the top of the page. */
    function renderStatCards() {
        const container = document.getElementById("statRow");
        if (!container) return;

        container.innerHTML = STAT_CARD_CONFIG.map((stat) => {
            const value = dashboardStats[stat.key]?.value ?? "—";
            const sub = dashboardStats[stat.key]?.sub;

            return `
                <div class="stat-card">
                    <div class="stat-icon" style="background:${stat.color}">${stat.icon}</div>
                    <div>
                        <div class="stat-label">${stat.label}</div>
                        <div class="stat-value">${value}</div>
                        ${sub ? `<div class="stat-sub">${sub}</div>` : ""}
                    </div>
                </div>
            `;
        }).join("");
    }

    /** Renders the stacked bar chart showing on-time/late/absent/leave per day. */
    function renderWeeklyChart() {
        const container = document.getElementById("chart");
        if (!container) return;

        const scale = CHART_HEIGHT_PX / CHART_MAX_TOTAL;
        const segment = (value, color) => `<div style="height:${value * scale}px;background:${color}"></div>`;

        container.innerHTML = weeklyAttendance.map((day) => {
            const total = day.onTime + day.late + day.absent + day.leave;
            return `
                <div class="bar-col">
                    <div class="bar-stack" style="height:${total * scale}px">
                        ${segment(day.leave, "var(--blue)")}
                        ${segment(day.absent, "var(--red)")}
                        ${segment(day.late, "var(--yellow)")}
                        ${segment(day.onTime, "var(--green)")}
                    </div>
                    <span>${day.day.slice(0, 3)}</span>
                </div>
            `;
        }).join("");
    }

    /**
     * Renders a real calendar for the current month, using the
     * browser's own date rather than a fixed/fake set of numbers.
     */
    function renderCalendar() {
        const container = document.getElementById("calendar");
        if (!container) return;

        const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
        const daysInPreviousMonth = new Date(year, month, 0).getDate();
        const firstWeekdayOfMonth = new Date(year, month, 1).getDay();

        const weekdayHeaders = WEEKDAY_LABELS.map((label) => `<div class="dow">${label}</div>`).join("");

        // Leading days from the previous month, shown muted so the
        // grid always starts on a Sunday.
        let leadingDays = "";
        for (let i = 0; i < firstWeekdayOfMonth; i += 1) {
            const day = daysInPreviousMonth - firstWeekdayOfMonth + 1 + i;
            leadingDays += `<div class="day muted">${day}</div>`;
        }

        let monthDays = "";
        for (let day = 1; day <= daysInCurrentMonth; day += 1) {
            const isToday = day === today.getDate() ? "today" : "";
            monthDays += `<div class="day ${isToday}">${day}</div>`;
        }

        container.innerHTML = weekdayHeaders + leadingDays + monthDays;
    }

    /** Renders the "List of Employee" summary table. */
    function renderEmployeeSummaryTable() {
        const table = document.getElementById("empTable");
        if (!table) return;

        const rows = employeeSummary.map((employee) => `
            <tr>
                <td>${employee.name}</td>
                <td>${employee.dept}</td>
                <td>${employee.role}</td>
                <td><span class="dot" style="background:${ATTENDANCE_STATUS_COLOR[employee.status]}"></span>${employee.status}</td>
                <td>${employee.contract}</td>
            </tr>
        `).join("");

        table.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Attendance</th>
                <th>Contract Type</th>
            </tr>
            ${rows}
        `;
    }

    /** Renders the list of pending leave requests in the sidebar card. */
    function renderLeaveRequests() {
        const container = document.getElementById("leaveList");
        if (!container) return;

        container.innerHTML = leaveRequests.map((leave) => `
            <div class="leave-item">
                <div class="avatar"></div>
                <div>
                    <div class="leave-name">${leave.name}</div>
                    <div class="leave-email">${leave.email}</div>
                </div>
                <span class="tag" style="background:${LEAVE_TYPE_COLOR[leave.type]}">${leave.type}</span>
                <button class="btn-view">View</button>
            </div>
        `).join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderStatCards();
        renderWeeklyChart();
        renderCalendar();
        renderEmployeeSummaryTable();
        renderLeaveRequests();
    });
})();
