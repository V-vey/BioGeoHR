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

// A display-only month: the days cannot be clicked. Today is outlined.
const Calendar = ({ month, year }) => {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  // Empty grid spacer cells for proper calendar alignment
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="invisible"></div>);
  }
  // one plain cell per day
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const isToday =
      day === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();

    calendarCells.push(
      <div
        key={`day-${day}`}
        className={`w-full h-8.5 flex items-center justify-center text-sm rounded text-gray-700 select-none
          ${isToday ? "border-2 border-blue-500 font-bold" : ""}
        `}
      >
        {day}
      </div>,
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
