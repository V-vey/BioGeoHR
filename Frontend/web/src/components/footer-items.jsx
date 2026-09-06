import React, { useState } from "react";

// Mock data to demonstrate pagination
const ITEMS_PER_PAGE = 5;
const mockData = Array.from({ length: 15 }, (_, i) => `Item ${i + 1}`);

export default function PaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages dynamically based on data length
  const totalPages = Math.ceil(mockData.length / ITEMS_PER_PAGE);

  // Handlers to navigate pages safely
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="w-full max-w-2xl mx-aut font-sans text-sm text-gray-600">
      {/* 1. Content Area */}
      {/* <div className="p-4 min-h-[150px]">
        <h3 className="font-semibold text-gray-800 mb-2">Page Content:</h3>
        <ul className="list-disc pl-5 space-y-1">
          {mockData
            .slice(
              (currentPage - 1) * ITEMS_PER_PAGE,
              currentPage * ITEMS_PER_PAGE,
            )
            .map((item, index) => (
              <li key={index}>{item}</li>
            ))}
        </ul>
      </div> */}

      {/* 2. Pagination Footer (Matches your image) */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 select-none">
        <div>
          <span>Page {currentPage}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          >
            &#12296; {/* Left angle bracket metric */}
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`transition-all ${
                  currentPage === page
                    ? "text-gray-800 font-medium underline underline-offset-4 decoration-1"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          >
            &#12297; {/* Right angle bracket metric */}
          </button>
        </div>
      </div>
    </div>
  );
}
