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

  spacing = true,
}) {
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
      <div className="flex flex-col flex-1">
        {spacing ? (
          <div className="py-4">
            <div className="flex-1 flex flex-wrap gap-4 content-start justify-center">
              {children}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-wrap gap-4 content-start justify-center">
            {children}
          </div>
        )}
      </div>

      <div>
        {pageShow && (
          <>
            <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5" />
            <div className="flex flex-col w-full px-4 py-2 justify-center">
              <div className="flex items-center justify-between w-full">
                <p className="text-s text-gray-600">
                  Page: {currentPage} to {totalPages}
                </p>

                <div className="flex flex-row gap-2">
                  <button
                    onClick={handleBack}
                    style={{ width: arrowSize, height: arrowSize }}
                    className="border border-[#b2b2b2] rounded-[6px] bg-white cursor-pointer flex items-center justify-center text-sm text-[#b2b2b2] hover:bg-gray-50"
                  >
                    ‹
                  </button>
                  <button
                    onClick={handleNext}
                    style={{ width: arrowSize, height: arrowSize }}
                    className="border border-[#b2b2b2] rounded-[6px] bg-white cursor-pointer flex items-center justify-center text-sm text-[#b2b2b2] hover:bg-gray-50"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {footer}
      </div>
    </div>
  );
}
