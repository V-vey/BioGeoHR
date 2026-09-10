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

// Sample data for now — swap for an API call once the payroll endpoints exist.
// Reflects Academia de Santiago of Tarlac, Inc.'s actual policy: semi-monthly
// cutoffs (1st–15th, 16th–30th), no overtime, SSS/PhilHealth/Pag-IBIG
// contributions instead of withholding tax.
const metrics = {
  nextRunDate: "Feb 5, 2026",
  nextRunPeriod: "Jan 16–31 period",
  estimatedCost: "₱612,800",
  costTrend: "+1.8% vs last run",
  employeesToPay: 48,
  pendingChanges: "2 pending changes",
  pendingApprovals: 1,
};

const upcomingRun = {
  period: "Jan 16–31, 2026",
  employeeCount: 48,
  estimatedNet: "₱478,900",
  deadline: "Approve by Feb 2, 5:00 PM",
};

const recentRuns = [
  {
    period: "Jan 1–15, 2026",
    payDate: "Jan 20, 2026",
    employees: 48,
    gross: "₱612,450.00",
    net: "₱478,120.60",
  },
  {
    period: "Dec 16–31, 2025",
    payDate: "Jan 5, 2026",
    employees: 47,
    gross: "₱601,300.00",
    net: "₱469,845.10",
  },
  {
    period: "Dec 1–15, 2025",
    payDate: "Dec 20, 2025",
    employees: 47,
    gross: "₱601,300.00",
    net: "₱469,845.10",
  },
];

const alerts = [
  {
    tone: "warning",
    text: "3 staff members logged 3+ lates this cutoff — deduction pending review",
  },
  {
    tone: "info",
    text: "2 loan balances fully paid — pending manual stop",
    to: "loans",
  },
  {
    tone: "info",
    text: "SSS contribution table update effective March 2026",
  },
];

export default function PayrollOutlet() {
  const [runs] = useState(recentRuns);

  return (
    <>
      {/* KPI row */}
      <div className="flex w-full justify-between gap-4">
        <Counts
          className="flex-1"
          display="Next Pay Run"
          count={metrics.nextRunDate}
          percentage={metrics.nextRunPeriod}
          icon={<CalendarClock className="text-[#6675EC] w-10 h-10" />}
        />
        <Counts
          className="flex-1"
          display="Estimated Payroll Cost"
          count={metrics.estimatedCost}
          percentage={metrics.costTrend}
          icon={<Wallet className="text-[#2AAF56] w-10 h-10" />}
        />
        <Counts
          className="flex-1"
          display="Employees to Pay"
          count={metrics.employeesToPay}
          percentage={metrics.pendingChanges}
          icon={<Users className="text-[#EACA3A] w-10 h-10" />}
        />
        <Counts
          className="flex-1"
          display="Pending Approvals"
          count={metrics.pendingApprovals}
          icon={<ClipboardCheck className="text-[#EC6668] w-10 h-10" />}
        />
      </div>

      <div className="h-4" />

      {/* Upcoming run banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4 md:px-6 md:py-5 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-[10px] bg-[#6675EC]/10 shrink-0">
            <CalendarClock className="w-5 h-5 text-[#6675EC]" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-[#3A3A3A]">
              Upcoming pay run — {upcomingRun.period}
            </div>
            <div className="text-sm text-[#8a90a3] mt-1">
              {upcomingRun.employeeCount} employees · Est. net pay{" "}
              <span className="font-semibold text-[#3A3A3A]">
                {upcomingRun.estimatedNet}
              </span>{" "}
              · {upcomingRun.deadline}
            </div>
          </div>
        </div>
        <Link
          to="run"
          className="inline-flex items-center justify-center gap-2 shrink-0 bg-[#6675EC] hover:bg-[#5563d6] text-white text-sm font-semibold rounded-[10px] px-5 py-2.5 transition-colors"
        >
          Review &amp; run payroll
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="h-4" />

      <div className="flex flex-wrap gap-4 items-start">
        {/* Recent payroll runs */}
        <div className="flex-2 min-w-75 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)] px-3 py-2">
          <div className="flex items-center justify-between">
            <h2>Recent Payroll Runs</h2>
            <div className="flex items-center gap-4">
              <Link
                to="loans"
                className="text-sm font-semibold text-[#6675EC] hover:underline"
              >
                Manage loans
              </Link>
              <Link
                to="payslips"
                className="text-sm font-semibold text-[#6675EC] hover:underline"
              >
                View payslips
              </Link>
            </div>
          </div>
          <div className="h-[2px] w-full bg-[#E0E0E0] my-0.5" />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-[#8a90a3]">
                  <th className="py-2 pr-3 font-semibold">Pay period</th>
                  <th className="py-2 px-3 font-semibold">Pay date</th>
                  <th className="py-2 px-3 font-semibold">Employees</th>
                  <th className="py-2 px-3 font-semibold">Gross pay</th>
                  <th className="py-2 px-3 font-semibold">Net pay</th>
                  <th className="py-2 pl-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.period}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 pr-3 text-sm font-medium text-[#3A3A3A]">
                      {run.period}
                    </td>
                    <td className="py-3 px-3 text-sm text-[#8a90a3]">
                      {run.payDate}
                    </td>
                    <td className="py-3 px-3 text-sm">{run.employees}</td>
                    <td className="py-3 px-3 text-sm">{run.gross}</td>
                    <td className="py-3 px-3 text-sm">{run.net}</td>
                    <td className="py-3 pl-3">
                      <StatusBadge tone="success">
                        <CheckCircle2 className="w-3 h-3" />
                        Paid
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Needs attention */}
        <div className="flex-1 min-w-70 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)] px-3 py-2">
          <h2>Needs Attention</h2>
          <div className="h-[2px] w-full bg-[#E0E0E0] my-0.5" />

          <div className="flex flex-col gap-3 py-2">
            {alerts.map((alert, i) => {
              const Icon = alert.tone === "warning" ? TriangleAlert : Info;
              const iconCls =
                alert.tone === "warning" ? "text-[#EACA3A]" : "text-[#6675EC]";
              const bgCls =
                alert.tone === "warning" ? "bg-[#EACA3A]/15" : "bg-[#6675EC]/10";
              const Wrapper = alert.to ? Link : "div";
              const wrapperProps = alert.to
                ? { to: alert.to, className: "hover:underline" }
                : {};
              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-[7px] shrink-0 ${bgCls}`}
                  >
                    <Icon className={`w-4 h-4 ${iconCls}`} />
                  </div>
                  <Wrapper
                    {...wrapperProps}
                    className={`text-sm text-[#8a90a3] text-left leading-snug ${wrapperProps.className ?? ""}`}
                  >
                    {alert.text}
                  </Wrapper>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
