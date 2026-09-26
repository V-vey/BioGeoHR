import React from "react";

export const months = [
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

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const Calendar = ({ month, year, selectedDate, onDateClick }) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

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
        onClick={() => onDateClick(day)}
        className={` w-full h-8.5 flex items-center justify-center text-sm rounded focus:outline-none transition-colors duration-150
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
    <div className="w-full">
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
    </div>
  );
};

export default Calendar;
