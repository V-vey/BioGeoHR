/**
 * common.js
 *
 * Behaviors shared across every BioGeoHR page. Loaded before each
 * page's own script so page scripts can focus on rendering data.
 */

/**
 * Wires up a collapsible sidebar submenu (e.g. "Employee" or
 * "Attendance"). Safe to call on pages that don't have the given
 * elements — it simply does nothing.
 */
function initSidebarSubmenu(toggleId, subNavId) {
    const toggle = document.getElementById(toggleId);
    const subNav = document.getElementById(subNavId);
    if (!toggle || !subNav) return;

    toggle.addEventListener("click", () => {
        toggle.classList.toggle("open");
        subNav.classList.toggle("open");
    });
}

/**
 * Wires up the search-bar filter dropdown used on the Employees and
 * Attendance pages. Closes itself when the user clicks outside it.
 */
function initFilterPanel() {
    const filterBtn = document.getElementById("filterBtn");
    const filterPanel = document.getElementById("filterPanel");
    if (!filterBtn || !filterPanel) return;

    filterBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        filterPanel.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
        const clickedInsidePanel = filterPanel.contains(event.target);
        const clickedTheButton = event.target === filterBtn;
        if (!clickedInsidePanel && !clickedTheButton) {
            filterPanel.classList.remove("open");
        }
    });
}

/**
 * Renders the "1 2 3 … N" pagination control into the given
 * container. This only draws the visual control — it isn't wired to
 * real paging yet, since that depends on how the backend returns
 * pages of results.
 */
function renderPagination(containerId, currentPage = 1, lastPage = 100) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, "...", lastPage];
    const pageItems = pageNumbers
        .map((page) => {
            const isActive = page === currentPage ? "active" : "";
            return `<span class="${isActive}">${page}</span>`;
        })
        .join("");

    container.innerHTML = `
        <button class="page-arrow">&lsaquo;</button>
        ${pageItems}
        <button class="page-arrow">&rsaquo;</button>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    initSidebarSubmenu("empToggle", "empSubNav");
    initSidebarSubmenu("attToggle", "attSubNav");
    initFilterPanel();
});
