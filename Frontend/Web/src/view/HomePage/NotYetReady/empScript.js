/**
 * empScript.js — All Employees page
 *
 * Renders the employee card grid. Sidebar toggles, the filter
 * dropdown, and pagination are handled by common.js.
 */

(function () {
    // TODO: replace with a real API call, e.g.
    //   const employees = await fetchEmployees();
    // Expected shape per entry:
    //   { id, name, email, dept, role, contract, join, status }
    const employees = [];

    // Maps an employee's availability status to a badge style —
    // presentation config, not employee data.
    const STATUS_META = {
        Available: { cls: "available", color: "var(--green)" },
        Unavailable: { cls: "unavailable", color: "var(--red)" },
        Break: { cls: "break", color: "var(--yellow)" },
        Leave: { cls: "leave", color: "var(--blue)" },
    };

    /** Builds the markup for a single employee card. */
    function renderEmployeeCard(employee) {
        const meta = STATUS_META[employee.status];
        return `
            <article class="emp-card">
                <div class="emp-card-top">
                    <div class="emp-id">ID - ${employee.id}</div>
                    <div>
                        <a class="view-btn" href="empProfile.html?id=${employee.id}">View</a>
                        <div class="emp-status ${meta.cls}">
                            ${employee.status}<span class="dot" style="background:${meta.color}"></span>
                        </div>
                    </div>
                </div>
                <div class="emp-body">
                    <div class="emp-avatar"></div>
                    <div>
                        <div class="emp-name">${employee.name}</div>
                        <div class="emp-email">${employee.email}</div>
                        <div class="emp-role">${employee.dept} | ${employee.role}</div>
                    </div>
                </div>
                <div class="emp-foot">
                    <div>Contract Type:<b>${employee.contract}</b></div>
                    <div>Join Date:<b>${employee.join}</b></div>
                </div>
            </article>
        `;
    }

    /** Renders every employee card into the grid. */
    function renderEmployeeGrid() {
        const grid = document.getElementById("empGrid");
        if (!grid) return;
        grid.innerHTML = employees.map(renderEmployeeCard).join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderEmployeeGrid();
        renderPagination("pageNums");
    });
})();
