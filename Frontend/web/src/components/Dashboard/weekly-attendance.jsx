"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function weeklyItems({ chartData }) {
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
    <ChartContainer config={chartConfig} className="w-full mt-2 h-[280px]">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="ontime" fill="var(--color-ontime)" radius={4} />
        <Bar dataKey="late" fill="var(--color-late)" radius={4} />
        <Bar dataKey="absent" fill="var(--color-absent)" radius={4} />
        <Bar dataKey="leave" fill="var(--color-leave)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
