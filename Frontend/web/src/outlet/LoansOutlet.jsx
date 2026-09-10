import { useState } from "react";
import { Plus, CircleOff, Landmark, Wallet, Info } from "lucide-react";
import StatusBadge from "@/components/Payroll/StatusBadge";

// Sample data for now — swap for an API call once the payroll endpoints exist.
// Rules reflected here (per the institution's data collection sheet):
//  - Loan types: SSS, Pag-IBIG, Company, Cash Advance — all tracked the same way
//  - Deduction is always a fixed monthly amount, no interest, no percentage-based option
//  - Deducted in full on one agreed date each month (not split across the two semi-monthly cutoffs)
//  - Fixed repayment term — must be fully paid before the school year ends
//  - An employee may hold only one active loan/cash advance at a time
//  - If net pay can't cover the full deduction, only a partial amount is deducted that period
//  - The system does not auto-stop a deduction when the balance hits zero — HR stops it manually
const loans = [
  {
    id: "LN-2026-014",
    employee: "Maria Santos",
    dept: "Teaching Staff",
    initials: "MS",
    color: "bg-[#EC6668]",
    type: "SSS Loan",
    principal: 24000,
    monthlyDeduction: 2000,
    balance: 8000,
    deductionDay: "5th of the month",
    term: "Before SY 2026–2027 ends",
    status: "active",
  },
  {
    id: "LN-2026-009",
    employee: "Renz Aquino",
    dept: "Non-teaching Staff",
    initials: "RA",
    color: "bg-[#6675EC]",
    type: "Pag-IBIG Loan",
    principal: 30000,
    monthlyDeduction: 2500,
    balance: 0,
    deductionDay: "5th of the month",
    term: "Before SY 2026–2027 ends",
    status: "fully_paid",
  },
  {
    id: "LN-2026-021",
    employee: "Carla Domingo",
    dept: "Teaching Staff",
    initials: "CD",
    color: "bg-purple-400",
    type: "Company Loan",
    principal: 10000,
    monthlyDeduction: 1000,
    balance: 4000,
    deductionDay: "5th of the month",
    term: "Before SY 2026–2027 ends",
    status: "active",
  },
  {
    id: "LN-2026-027",
    employee: "Paolo Ramos",
    dept: "Non-teaching Staff",
    initials: "PR",
    color: "bg-amber-400",
    type: "Cash Advance",
    principal: 5000,
    monthlyDeduction: 5000,
    balance: 5000,
    deductionDay: "5th of the month",
    term: "Single cutoff",
    status: "active",
  },
  {
    id: "LN-2025-098",
    employee: "Jenny Cruz",
    dept: "Teaching Staff",
    initials: "JC",
    color: "bg-[#2AAF56]",
    type: "SSS Loan",
    principal: 18000,
    monthlyDeduction: 1500,
    balance: 0,
    deductionDay: "5th of the month",
    term: "Before SY 2026–2027 ends",
    status: "fully_paid",
  },
];

const peso = (n) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 0 });

export default function LoansOutlet() {
  const [rows, setRows] = useState(loans);

  const stopDeduction = (id) =>
    setRows((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "stopped" } : l)),
    );

  const activeCount = rows.filter((l) => l.status === "active").length;
  const pendingStopCount = rows.filter((l) => l.status === "fully_paid").length;
  const totalOutstanding = rows
    .filter((l) => l.status !== "stopped")
    .reduce((s, l) => s + l.balance, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Stat row */}
      <div className="flex w-full justify-between gap-4">
        <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
          <div className="font-medium text-[#6675EC] text-left">Active Loans</div>
          <div className="flex items-start justify-between">
            <span className="text-[24px] font-regular text-[#3A3A3A]">
              {activeCount}
            </span>
            <Wallet className="text-[#6675EC] w-10 h-10" />
          </div>
        </div>
        <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
          <div className="font-medium text-[#6675EC] text-left">
            Total Outstanding
          </div>
          <div className="flex items-start justify-between">
            <span className="text-[24px] font-regular text-[#3A3A3A]">
              {peso(totalOutstanding)}
            </span>
            <Landmark className="text-[#2AAF56] w-10 h-10" />
          </div>
        </div>
        <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
          <div className="font-medium text-[#6675EC] text-left">
            Fully Paid — Pending Stop
          </div>
          <div className="flex items-start justify-between">
            <span className="text-[24px] font-regular text-[#3A3A3A]">
              {pendingStopCount}
            </span>
            <CircleOff className="text-[#EACA3A] w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Policy note */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-[#6675EC]/10 rounded-[10px]">
        <Info className="w-4 h-4 text-[#6675EC] shrink-0 mt-0.5" />
        <span className="text-xs text-[#8a90a3] text-left leading-relaxed">
          Loans are interest-free with a fixed monthly deduction taken on an agreed
          date each month, repaid within a fixed term. An employee may hold only one
          active loan or cash advance at a time — a new one can't be issued until the
          existing balance is fully paid off. When a balance reaches ₱0, HR stops the
          deduction manually.
        </span>
      </div>

      {/* Loans table */}
      <div className="bg-white border border-[#eef0f5] rounded-[14px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f5]">
          <div className="text-left">
            <h2 className="m-0 text-base font-bold text-[#3A3A3A]">
              Loans &amp; Cash Advances
            </h2>
            <div className="text-xs text-[#8a90a3] mt-0.5">
              SSS, Pag-IBIG, company loans, and cash advances — all tracked the same way
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 bg-[#6675EC] hover:bg-[#5563d6] text-white text-sm font-semibold rounded-[8px] px-3.5 py-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New loan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#8a90a3]">
                <th className="py-2 pl-5 pr-3 font-semibold">Employee</th>
                <th className="py-2 px-3 font-semibold">Type</th>
                <th className="py-2 px-3 font-semibold">Principal</th>
                <th className="py-2 px-3 font-semibold">Monthly deduction</th>
                <th className="py-2 px-3 font-semibold">Balance</th>
                <th className="py-2 px-3 font-semibold">Deducted on</th>
                <th className="py-2 px-3 font-semibold">Status</th>
                <th className="py-2 pr-5 pl-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((loan) => (
                <tr
                  key={loan.id}
                  className="border-t border-[#eef0f5] hover:bg-gray-50"
                >
                  <td className="py-3 pl-5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold shrink-0 ${loan.color}`}
                      >
                        {loan.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#3A3A3A]">
                          {loan.employee}
                        </div>
                        <div className="text-[11px] text-[#8a90a3]">
                          {loan.dept}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-sm text-[#8a90a3]">
                    {loan.type}
                  </td>
                  <td className="py-3 px-3 text-sm">{peso(loan.principal)}</td>
                  <td className="py-3 px-3 text-sm">
                    {peso(loan.monthlyDeduction)}
                  </td>
                  <td className="py-3 px-3 text-sm font-semibold">
                    {peso(loan.balance)}
                  </td>
                  <td className="py-3 px-3 text-sm text-[#8a90a3]">
                    {loan.deductionDay}
                  </td>
                  <td className="py-3 px-3">
                    {loan.status === "active" && (
                      <StatusBadge tone="success">Active</StatusBadge>
                    )}
                    {loan.status === "fully_paid" && (
                      <StatusBadge tone="warning">Fully paid</StatusBadge>
                    )}
                    {loan.status === "stopped" && (
                      <StatusBadge tone="neutral">Stopped</StatusBadge>
                    )}
                  </td>
                  <td className="py-3 pr-5 pl-3">
                    {loan.status === "fully_paid" && (
                      <button
                        type="button"
                        onClick={() => stopDeduction(loan.id)}
                        className="text-xs font-semibold text-[#6675EC] hover:underline whitespace-nowrap"
                      >
                        Stop deduction
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
