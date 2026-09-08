export default function Pagination({ currentPage = 1, lastPage = 100 }) {
  const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, "...", lastPage];

  return (
    <div className="flex items-center gap-1">
      {/* Previous Arrow */}
      <button className="w-6.5 h-6.5 border border-[#eef0f5] rounded-[6px] bg-white cursor-pointer flex items-center justify-center text-sm text-[#8a90a3] hover:bg-gray-50">
        ‹
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => (
        <span
          key={index}
          className={`p-[4px_8px] rounded-[6px] cursor-pointer text-xs transition-colors
            ${
              page === currentPage
                ? "bg-[#6c63ff] text-white"
                : "text-[#8a90a3] hover:bg-[#f2f3fb]"
            }`}
        >
          {page}
        </span>
      ))}

      {/* Next Arrow */}
      <button className="w-6.5 h-6.5 border border-[#eef0f5] rounded-[6px] bg-white cursor-pointer flex items-center justify-center text-sm text-[#8a90a3] hover:bg-gray-50">
        ›
      </button>
    </div>
  );
}
