/**
 * empProfileScript.js — Employee Profile page
 *
 * Renders the Overview and Personal Info tabs for a single
 * employee, selected via the ?id= query parameter.
 */

(function () {
    // TODO: replace with a real API call keyed by employee id, e.g.
    //   const profiles = await fetchEmployeeProfile(id);
    // Expected shape per entry — see renderProfileSummaryCard and
    // renderPersonalInfoTab below for every field this page reads:
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
    const profiles = {};

    // Maps a leave request's status to a badge style — presentation
    // config, not leave data.
    const LEAVE_BADGE_META = {
        Pending: { cls: "pending", color: "var(--yellow)" },
        Rejected: { cls: "rejected", color: "var(--red)" },
        Approved: { cls: "approved", color: "var(--green)" },
    };

    /** Looks up the employee named by ?id= in the current URL. */
    function getRequestedEmployee() {
        const params = new URLSearchParams(window.location.search);
        const requestedId = params.get("id");
        return profiles[requestedId] || null;
    }

    /** Wires up the Overview / Personal Info tab switcher. */
    function initTabs() {
        const tabOverview = document.getElementById("tabOverview");
        const tabPersonal = document.getElementById("tabPersonal");
        const overviewPane = document.getElementById("overviewPane");
        const personalPane = document.getElementById("personalPane");
        const viewMoreBtn = document.getElementById("viewMoreBtn");

        function showTab(tabName) {
            const isOverview = tabName === "overview";
            tabOverview.classList.toggle("active", isOverview);
            tabPersonal.classList.toggle("active", !isOverview);
            overviewPane.classList.toggle("is-hidden", !isOverview);
            personalPane.classList.toggle("is-hidden", isOverview);
        }

        tabOverview.addEventListener("click", () => showTab("overview"));
        tabPersonal.addEventListener("click", () => showTab("personal"));
        viewMoreBtn.addEventListener("click", () => showTab("personal"));
    }

    // ---- Overview tab ----

    /** Renders the four leave-balance pills (Annual, Sick, Paternity, Unpaid). */
    function renderLeaveBalances(employee) {
        const container = document.getElementById("leavePillRow");
        const balances = employee.leaveBalances;

        container.innerHTML = `
            <div class="leave-pill"><span>Annual Leave</span><span class="count">${balances.annual}</span></div>
            <div class="leave-pill"><span>Sick Leave</span><span class="count">${balances.sick}</span></div>
            <div class="leave-pill"><span>Paternity Leave</span><span class="count">${balances.paternity}</span></div>
            <div class="leave-pill"><span>Unpaid Leave</span><span class="count">${balances.unpaid}</span></div>
        `;
    }

    /** Renders the employee's recent leave request cards. */
    function renderRecentLeave(employee) {
        const container = document.getElementById("recentLeaveGrid");

        container.innerHTML = employee.recentLeave.map((leave) => {
            const meta = LEAVE_BADGE_META[leave.status];
            return `
                <article class="leave-card">
                    <div class="leave-card-top">
                        <span class="leave-badge ${meta.cls}">
                            ${leave.status}<span class="dot" style="background:${meta.color}"></span>
                        </span>
                        <a class="view-btn" href="#">View</a>
                    </div>
                    <div class="leave-detail"><span>Type of Leave:</span><b>${leave.type}</b></div>
                    <div class="leave-detail"><span>Starting Date:</span><b>${leave.start}</b></div>
                    <div class="leave-detail"><span>Ending Date:</span><b>${leave.end}</b></div>
                    <div class="leave-detail"><span>Number of Days:</span><b>${leave.days}</b></div>
                </article>
            `;
        }).join("");
    }

    /** Fills in the right-hand profile summary card. */
    function renderProfileSummaryCard(employee) {
        const set = (id, value) => { document.getElementById(id).textContent = value; };

        const statusEl = document.getElementById("profileStatus");
        statusEl.textContent = employee.status;
        statusEl.insertAdjacentHTML("beforeend", `<span class="dot" style="background:var(--green);margin-left:4px;"></span>`);

        set("profileName", employee.name);
        set("profileEmail", employee.email);
        set("pEmployeeId", employee.id);
        set("pJoinDate", employee.join);
        set("pDept", employee.dept);
        set("pRole", employee.role);
        set("pContract", employee.contract);
        set("pGender", employee.gender);
        set("pBirth", employee.birthDate);
        set("pAge", employee.age);
        set("pContact", employee.contact);
        set("pEducation", employee.education);
        set("pDegree", employee.degree);
    }

    /** Fills in the Attendance and Salary summary boxes. */
    function renderAttendanceAndSalary(employee) {
        document.getElementById("pOnTimeDays").textContent = `${employee.attendance.onTimeDays} days Attended`;
        document.getElementById("pLateDuration").textContent = `${employee.attendance.lateDuration} Lateness`;
        document.getElementById("pSalaryPerHour").textContent = `₱${employee.salaryPerHour} Per hours`;
    }

    function renderOverviewTab(employee) {
        renderLeaveBalances(employee);
        renderAttendanceAndSalary(employee);
        renderRecentLeave(employee);
        renderProfileSummaryCard(employee);
        renderPagination("pageNums");
    }

    // ---- Personal Info tab ----

    /** Builds a single labeled input/select for the Personal Info form. */
    function renderPersonalInfoField(field) {
        if (field.type === "select") {
            const options = field.options
                .map((option) => `<option ${option === field.value ? "selected" : ""}>${option}</option>`)
                .join("");
            return `
                <div class="pi-field">
                    <label>${field.label}</label>
                    <select>${options}</select>
                </div>
            `;
        }

        return `
            <div class="pi-field">
                <label>${field.label}</label>
                <input type="text" value="${field.value}">
            </div>
        `;
    }

    /** Renders the header card and editable form on the Personal Info tab. */
    function renderPersonalInfoTab(employee) {
        document.getElementById("piNameLine").innerHTML =
            `[${employee.id}] ${employee.name} - ${employee.dept} | ${employee.role}`;
        document.getElementById("piMonthly").textContent = employee.monthlySalary;
        document.getElementById("piDaily").textContent = employee.dailyWage;
        document.getElementById("piHourly").textContent = employee.hourlyRate;

        const fields = [
            { label: "Last name*", value: employee.lastName, type: "text" },
            { label: "First name*", value: employee.firstName, type: "text" },
            { label: "Middle name", value: employee.middleName, type: "text" },
            { label: "Gender*", value: employee.gender, type: "select", options: ["Male", "Female"] },
            { label: "Birth place", value: employee.birthPlace, type: "text" },
            { label: "Address*", value: employee.address, type: "text" },
            { label: "Nationality*", value: employee.nationality, type: "text" },
            { label: "Status*", value: employee.maritalStatus, type: "select", options: ["Single", "Married"] },
            { label: "Date of Birth*", value: employee.birthDate, type: "text" },
            { label: "Education*", value: employee.education, type: "text" },
            { label: "Degree*", value: employee.degree, type: "text" },
            { label: "Monthly Salary*", value: employee.monthlySalary, type: "text" },
            { label: "Standard Work Hours per Day", value: employee.standardHours, type: "text" },
        ];

        document.getElementById("piFormGrid").innerHTML = fields.map(renderPersonalInfoField).join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        initTabs();

        const employee = getRequestedEmployee();
        // No matching profile yet (e.g. the backend isn't connected,
        // or an unknown id was passed) — leave the tabs empty rather
        // than rendering with missing data.
        if (!employee) return;

        renderOverviewTab(employee);
        renderPersonalInfoTab(employee);
    });
})();
