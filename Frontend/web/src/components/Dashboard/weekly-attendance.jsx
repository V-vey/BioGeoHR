import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data structured to match the visual stack in your image
const attendanceData = [
  { day: "Sunday", Leave: 70, Absent: 150, Late: 130, "On-Time": 250 },
  { day: "Monday", Leave: 40, Absent: 30, Late: 60, "On-Time": 1250 },
  { day: "Tuesday", Leave: 30, Absent: 30, Late: 70, "On-Time": 520 },
  { day: "Wednesday", Leave: 100, Absent: 300, Late: 480, "On-Time": 390 },
  { day: "Thursday", Leave: 100, Absent: 170, Late: 370, "On-Time": 810 },
  { day: "Friday", Leave: 50, Absent: 50, Late: 230, "On-Time": 1170 },
];

// Mapping hex colors precisely to match your mockup UI colors
const colors = {
  leave: "#5c6bc0", // Indigo/Blue
  absent: "#ef5350", // Coral Red
  late: "#f4d03f", // Sunny Yellow
  onTime: "#2ecc71", // Emerald Green
};

// Custom Tooltip Component mimicking the exact white popover in the mockup
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    // Reverse the payload order so "On-Time" displays at the top of the list
    const reversedPayload = [...payload].reverse();

    return (
      <div className="bg-white p-3 border border-gray-100 rounded-md shadow-lg text-xs font-sans text-gray-600 space-y-1.5 min-w-[140px]">
        {reversedPayload.map((item, index) => {
          let dotColor = "";
          if (item.name === "On-Time") dotColor = "bg-[#2ecc71]";
          if (item.name === "Late") dotColor = "bg-[#f4d03f]";
          if (item.name === "Absent") dotColor = "bg-[#ef5350]";
          if (item.name === "Leave") dotColor = "bg-[#5c6bc0]";

          return (
            <div key={index} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${dotColor}`} />
              <span>
                {item.name}:{" "}
                <strong className="text-gray-800">{item.value} People</strong>
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function WeeklyAttendanceChart() {
  return (
    <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
      {/* Chart Title Header */}
      <h2 className="text-center text-indigo-500 font-bold text-2xl mb-6 tracking-wide">
        Weekly Attendance
      </h2>

      {/* Main Chart Area */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={attendanceData}
            margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
            barCategoryGap="25%"
          >
            {/* Horizontal Grid lines only */}
            <CartesianGrid
              strokeDasharray="0"
              vertical={false}
              stroke="#f0f0f0"
            />

            <XAxis
              dataKey="day"
              axisLine={{ stroke: "#4a5568", strokeWidth: 2 }}
              tickLine={false}
              tick={{ fill: "#4a5568", fontWeight: 600, fontSize: 14 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4a5568", fontWeight: 600, fontSize: 14 }}
              domain={[0, 1500]}
              ticks={[0, 250, 500, 750, 1000, 1250, 1500]}
            />

            {/* Popover data labels */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />

            {/* Stacked Bars - Order from bottom to top */}
            <Bar dataKey="Leave" stackId="attendance" fill={colors.leave} />
            <Bar dataKey="Absent" stackId="attendance" fill={colors.absent} />
            <Bar dataKey="Late" stackId="attendance" fill={colors.late} />
            {/* The top bar gets the rounded pill shape corners */}
            <Bar
              dataKey="On-Time"
              stackId="attendance"
              fill={colors.onTime}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Bottom Legend Row */}
      <div className="flex justify-center items-center gap-5 mt-4 text-xs font-medium text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2ecc71]" /> On-Time
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#f4d03f]" /> Late
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ef5350]" /> Absent
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#5c6bc0]" /> Leave
        </div>
      </div>
    </div>
  );
}
