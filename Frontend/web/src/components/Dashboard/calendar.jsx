import React, { useState } from "react";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 1. Find the weekday alignment for the 1st of the month (0 = Sun, 1 = Mon, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // 2. Fetch the total number of days in the active month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // 3. Navigation triggers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 4. Capture clicked date
  const handleDateClick = (day) => {
    setSelectedDate(new Date(year, month, day));
  };

  // 5. Build layout cells
  const calendarCells = [];

  // Empty grid spacer cells for proper calendar alignment
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="invisible"></div>);
  }

  // Active day button elements
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const isToday =
      day === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    const isSelected =
      selectedDate &&
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear();

    calendarCells.push(
      <button
        key={`day-${day}`}
        onClick={() => handleDateClick(day)}
        className={`w-full h-10 flex items-center justify-center text-sm rounded focus:outline-none transition-colors duration-150
          ${isToday ? "border-2 border-blue-500 font-bold" : ""}
          ${
            isSelected
              ? "bg-blue-600 text-white font-semibold hover:bg-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }
        `}
      >
        {day}
      </button>,
    );
  }

  return (
    <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm focus:outline-none"
        >
          &lt;
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          {months[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm focus:outline-none"
        >
          &gt;
        </button>
      </div>

      {/* Weekday Row Labels */}
      <div className="grid grid-cols-7 text-center font-semibold text-gray-500 text-xs mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid Grid Layout */}
      <div className="grid grid-cols-7 gap-1 text-center">{calendarCells}</div>

      {/* Selected Date Summary Output */}
      {selectedDate && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-center text-sm text-gray-600">
          Selected Date:{" "}
          <span className="font-semibold text-blue-600">
            {selectedDate.toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default Calendar;
