"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function ChartBarDemoLegend({ chartData }) {
  const chartConfig = {
    ontime: {
      label: "On-Time",
      color: "#2AAF56",
    },
    late: {
      label: "Late",
      color: "#EACA3A",
    },
    absent: {
      label: "Absent",
      color: "#EC6668",
    },
    leave: {
      label: "Leave",
      color: "#6675EC",
    },
  };
  return (
    <div className="min-h-[400px] w-full flex-1 px-3 py-2 bg-white border border-gray-100 rounded-xl ">
      <h2>Weekly Attendance</h2>
      <div className="h-[2px] w-full bg-[#E0E0E0] my-0.5" />
      <ChartContainer config={chartConfig} className="w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />

          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />

          <Bar dataKey="ontime" fill="var(--color-ontime)" radius={4} />
          <Bar dataKey="late" fill="var(--color-late)" radius={4} />
          <Bar dataKey="absent" fill="var(--color-absent)" radius={4} />
          <Bar dataKey="leave" fill="var(--color-leave)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
