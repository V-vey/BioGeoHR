/**
 * attendanceScript.js — Attendance page
 *
 * Renders the daily attendance card grid. Sidebar toggles, the
 * filter dropdown, and pagination are handled by common.js.
 */

(function () {
    // TODO: replace with a real API call, e.g.
    //   const attendanceRecords = await fetchAttendanceRecords();
    // Expected shape per entry:
    //   { id, name, role, status, date, overtime, clockIn, clockOut, duration, lateTime }
    const attendanceRecords = [];

    // Maps an attendance status to a badge style — presentation
    // config, not attendance data.
    const STATUS_META = {
        "On-time": { cls: "on-time", color: "var(--green)" },
        "Late": { cls: "late", color: "var(--yellow)" },
    };

    /** Builds the markup for a single attendance record card. */
    function renderAttendanceCard(record) {
        const meta = STATUS_META[record.status];
        return `
            <article class="att-card">
                <div class="att-card-top">
                    <div class="att-id">ID - ${record.id}</div>
                    <div class="office-badge">Office</div>
                </div>
                <div class="att-name-row">
                    <div class="att-name">${record.name}</div>
                    <span class="att-status ${meta.cls}">
                        ${record.status}<span class="dot" style="background:${meta.color}"></span>
                    </span>
                </div>
                <div class="att-role">${record.role}</div>
                <div class="att-detail-grid">
                    <div>Date: <b>${record.date}</b></div>
                    <div>Clock-in: <b>${record.clockIn}</b></div>
                    <div>Overtime: <b>${record.overtime}</b></div>
                    <div>Clock-out: <b>${record.clockOut}</b></div>
                    <div>Duration: <b>${record.duration}</b></div>
                    <div>Late Time: <b>${record.lateTime}</b></div>
                </div>
            </article>
        `;
    }

    /** Renders every attendance record card into the grid. */
    function renderAttendanceGrid() {
        const grid = document.getElementById("attGrid");
        if (!grid) return;
        grid.innerHTML = attendanceRecords.map(renderAttendanceCard).join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderAttendanceGrid();
        renderPagination("pageNums");
    });
})();
