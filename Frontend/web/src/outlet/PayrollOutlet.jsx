import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Users,
  CalendarClock,
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  TriangleAlert,
  Info,
} from "lucide-react";

import Counts from "@/components/Dashboard/counts";
import StatusBadge from "@/components/Payroll/StatusBadge";

export default function PayrollOutlet() {
  return (
    <>
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">
          Payroll Overview
        </h2>
      </div>
    </>
  );
}
