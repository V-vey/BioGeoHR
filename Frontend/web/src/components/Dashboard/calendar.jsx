import React, { useState } from "react";

export default function Calendar() {
  // Configured to dynamically match the exact layout structure from your image
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // September (0-indexed)
  const selectedDay = 2;

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Calculate date properties
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  const gridCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    gridCells.push({
      dayNumber: prevTotalDays - i,
      isCurrentMonth: false,
    });
  }

  // 2. Active month days
  for (let day = 1; day <= totalDays; day++) {
    gridCells.push({
      dayNumber: day,
      isCurrentMonth: true,
      isActive: day === selectedDay,
    });
  }

  // 3. Next month leading days (Filling out a 5-row / 35-slot grid layout)
  const totalSlots = 35;
  const nextMonthPadding = totalSlots - gridCells.length;
  for (let day = 1; day <= nextMonthPadding; day++) {
    gridCells.push({
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
      {/* Calendar Header */}
      <h2 className="text-center text-indigo-500 font-semibold text-2xl mb-4">
        Calendar
      </h2>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 text-center">
        {weekdays.map((day, idx) => (
          <div
            key={idx}
            className="text-xs text-gray-400 py-2 border-b border-gray-100 font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center">
        {gridCells.map((cell, idx) => {
          // Dynamic conditional styling for borders and active day rings
          return (
            <div
              key={idx}
              className={`
                relative h-12 flex items-center justify-center text-sm border-b border-gray-100 
                ${(idx + 1) % 7 !== 0 ? "border-r" : ""} 
                ${!cell.isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                ${cell.isActive ? "text-blue-500 font-semibold" : ""}
              `}
            >
              {cell.dayNumber}

              {/* Blue selection circle ring matching the UI image */}
              {cell.isActive && (
                <div className="absolute inset-0 m-auto w-8 h-8 border border-blue-500 rounded-full pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
