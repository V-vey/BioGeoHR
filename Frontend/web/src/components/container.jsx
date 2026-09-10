import FilterDropdown from "./FilterDropdown";

export default function Containers({
  name,
  currentPage,
  setCurrentPage,
  children,
  arrowSize,
  filterConfig,
  onFilterApply,
  contH,
}) {
  const handleBack = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
      <div className="flex flex-col w-full">
        <div className="flex flex-row justify-between items-center">
          <h2 className="flex items-start">{name}</h2>

          <div className="flex flex-row items-center gap-2">
            <input
              type="search"
              name="search"
              id="search"
              placeholder="Search Name"
              className="border-[#8E8E8E] border-1 rounded-2xl w-100 px-3"
            />
            {filterConfig && (
              <FilterDropdown
                config={filterConfig}
                onApply={onFilterApply}
                arrowSize={arrowSize}
              />
            )}
          </div>
        </div>

        <div className="h-2" />
        <div className="h-[1px] w-full m-0 bg-[#E0E0E0] my-0.5" />

        <div className="flex-1 flex flex-wrap gap-4 content-start justify-center py-4">
          {children}
        </div>

        <div className="h-[1px] w-full m-0 bg-[#E0E0E0] my-0.5" />
        <div className="pt-2 flex items-center justify-between w-full">
          <p className="text-s text-gray-600">Page: {currentPage}</p>

          <div className="flex flex-row gap-2">
            <button
              onClick={handleBack}
              style={{ width: arrowSize, height: arrowSize }}
              className="border border-[#eef0f5] rounded-[6px] bg-white cursor-pointer flex items-center justify-center text-sm text-[#8a90a3] hover:bg-gray-50"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              style={{ width: arrowSize, height: arrowSize }}
              className="border border-[#eef0f5] rounded-[6px] bg-white cursor-pointer flex items-center justify-center text-sm text-[#8a90a3] hover:bg-gray-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
