function useCalendarDays() {
  return useMemo(() => {
    const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    const firstWeekdayOfMonth = new Date(year, month, 1).getDay();

    const leadingDays = Array.from(
      { length: firstWeekdayOfMonth },
      (_, i) => daysInPreviousMonth - firstWeekdayOfMonth + 1 + i,
    );
    const monthDays = Array.from(
      { length: daysInCurrentMonth },
      (_, i) => i + 1,
    );

    return {
      weekdayLabels: WEEKDAY_LABELS,
      leadingDays,
      monthDays,
      todayDate: today.getDate(),
    };
  }, []);
}

export default function Calendar() {
  const { weekdayLabels, leadingDays, monthDays, todayDate } =
    useCalendarDays();
  return (
    <div className="flex-1 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
      <h2>Calendar</h2>

      <div className="grid grid-cols-7 gap-2 text-center">
        {weekdayLabels.map((label) => (
          <div
            className="text-xs font-semibold text-[#6c63ff] pb-1.5 uppercase tracking-wider"
            key={label}
          >
            {label}
          </div>
        ))}

        {leadingDays.map((day, index) => (
          <div
            className="flex items-center justify-content shadow-none center aspect-square text-xs font-medium text-[#8a90a3] opacity-50"
            key={`lead-${index}`}
          >
            {day}
          </div>
        ))}

        {monthDays.map((day) => (
          <div
            className={`flex items-center justify-center soccer aspect-square text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer
          ${
            day === todayDate
              ? "bg-[#6c63ff] text-white font-bold"
              : "text-[#1f2430] hover:bg-[#f4f6fb]"
          }`}
            key={day}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
