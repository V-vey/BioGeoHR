import { Inbox } from "lucide-react";
import FilterDropdown from "./FilterDropdown";

export default function Containers({
  name,
  currentPage,
  setCurrentPage,
  children,
  arrowSize,
  filterConfig,
  onFilterApply,
  totalPages = 1,
  setSearch,
  search,
  searchShow = true,
  pageShow = true,
  headerDefault = true, // normal header
  header, // costomize header
  minH,
  maxH,
  footer,
  total,
  perPage, // rows per page: with a numeric total the footer says "Showing 1–10 of 16"
  spacing = true,
  // shown in place of the content when total is 0; false for a page that shows its own message
  emptyText = "No data to show.",
  loading = false, // still loading: not "empty" yet
}) {
  const empty = emptyText !== false && !loading && total === 0;
  const content = empty ? (
    <div className="flex flex-col items-center justify-center gap-2 w-full py-10 text-[#8a90a3]">
      <Inbox className="w-8 h-8" strokeWidth={1.5} />
      <p className="m-0 text-sm">{emptyText}</p>
    </div>
  ) : (
    children
  );
  // the rows on this page, counted from 1 (none when the list is empty)
  const showing =
    perPage && typeof total === "number"
      ? total === 0
        ? "Showing 0 of 0"
        : `Showing ${(currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, total)} of ${total}`
      : total != null
        ? `Total: ${total}`
        : null;
  const pagerButton =
    "px-3 py-1 rounded-[8px] border border-[#b2b2b2] bg-white text-[#3A3A3A] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white";

  const handleBack = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div
      className="flex flex-col bg-white border border-[#b2b2b2] rounded-[10px]"
      style={{ minHeight: minH, maxHeight: maxH }}
    >
      <div className="flex flex-col w-full px-4 py-3 justify-center">
        {headerDefault && (
          <div className="flex flex-row justify-between items-center">
            <h2 className="flex items-start ">{name}</h2>
            <div className="flex flex-row items-center gap-2">
              {searchShow && (
                <input
                  type="search"
                  name="search"
                  id="search"
                  placeholder="Search Name"
                  value={search}
                  onChange={(e) => setSearch?.(e.target.value)}
                  className="border-[#8E8E8E] border-1 rounded-2xl w-100 px-3"
                />
              )}
              {filterConfig && (
                <FilterDropdown
                  config={filterConfig}
                  onApply={onFilterApply}
                  arrowSize={arrowSize}
                />
              )}
            </div>
          </div>
        )}
        {/* new header */}
        {header}
      </div>
      <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5" />
      {/* with a fixed height (maxH) the content scrolls inside the box, so the page footer never spills out of it */}
      <div
        className={`flex flex-col flex-1 ${maxH ? "min-h-0 overflow-y-auto" : ""}`}
      >
        {spacing ? (
          <div className="py-4">
            <div className="flex-1 flex flex-wrap gap-4 content-start justify-center">
              {content}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-wrap gap-4 content-start justify-center">
            {content}
          </div>
        )}
      </div>

      <div>
        {pageShow && (
          <>
            <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5" />
            {/* wraps onto two lines in a narrow box (the dashboard cards) */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 w-full px-4 py-3 text-sm text-[#8a90a3] select-none">
              <span>{showing}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentPage <= 1}
                  className={pagerButton}
                >
                  Previous
                </button>
                <span className="whitespace-nowrap">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentPage >= totalPages}
                  className={pagerButton}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        {footer}
      </div>
    </div>
  );
}
