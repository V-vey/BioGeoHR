import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  TriangleAlert,
  Info,
} from "lucide-react";

// Sample data for now — swap for an API call once the payroll endpoints exist.
// Computation rules, per Academia de Santiago of Tarlac, Inc.'s policy:
//  - Daily rate = monthly salary / 26 working days; no overtime is paid at all
//  - Late deduction = 1 day's pay for every 3 lates logged within the month
//    (15-minute grace period per instance; undertime is not deducted the same way)
//  - SSS ~5%, PhilHealth 2.5%, and Pag-IBIG 2.5% of monthly salary are withheld
//    in full during the 1st–15th cutoff; there is no withholding tax
//  - Active loan installments (see the Loans page) are deducted on the same cutoff
const payPeriod = { range: "Jan 1–15, 2026", payDate: "Jan 20, 2026" };

const employees = [
  {
    id: "MR-0001",
    name: "Maria Santos",
    dept: "Teaching Staff",
    monthlySalary: 16000,
    lates: 1,
    loan: { type: "SSS Loan", amount: 2000 },
    initials: "MS",
    color: "bg-[#EC6668]",
    selected: true,
  },
  {
    id: "MR-0002",
    name: "Renz Aquino",
    dept: "Non-teaching Staff",
    monthlySalary: 15000,
    lates: 4,
    loan: null,
    initials: "RA",
    color: "bg-[#6675EC]",
    selected: true,
  },
  {
    id: "MR-0003",
    name: "Carla Domingo",
    dept: "Teaching Staff",
    monthlySalary: 18000,
    lates: 0,
    loan: { type: "Company Loan", amount: 1000 },
    initials: "CD",
    color: "bg-purple-400",
    selected: true,
  },
  {
    id: "MR-0004",
    name: "Paolo Ramos",
    dept: "Non-teaching Staff",
    monthlySalary: 14000,
    lates: 3,
    loan: { type: "Cash Advance", amount: 5000 },
    initials: "PR",
    color: "bg-amber-400",
    selected: false,
    flag: "3 lates this cutoff — review before approving",
  },
  {
    id: "MR-0005",
    name: "Jenny Cruz",
    dept: "Teaching Staff",
    monthlySalary: 17000,
    lates: 2,
    loan: null,
    initials: "JC",
    color: "bg-[#2AAF56]",
    selected: true,
  },
  {
    id: "MR-0006",
    name: "Miguel Torres",
    dept: "Non-teaching Staff",
    monthlySalary: 15500,
    lates: 0,
    loan: null,
    initials: "MT",
    color: "bg-sky-400",
    selected: true,
  },
];

const money = (n) =>
  n.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const computeRow = (e) => {
  const dailyRate = e.monthlySalary / 26;
  const gross = e.monthlySalary / 2; // semi-monthly base pay
  const lateDeduction = Math.floor(e.lates / 3) * dailyRate;
  const sss = e.monthlySalary * 0.05;
  const philhealth = e.monthlySalary * 0.025;
  const pagibig = e.monthlySalary * 0.025;
  const statutory = sss + philhealth + pagibig;
  const loanDeduction = e.loan ? e.loan.amount : 0;
  const deductions = lateDeduction + statutory + loanDeduction;
  const net = gross - deductions;
  return { dailyRate, gross, lateDeduction, statutory, loanDeduction, deductions, net };
};

const steps = [
  { label: "Review hours", state: "done" },
  { label: "Review pay", state: "active" },
  { label: "Approve", state: "upcoming" },
  { label: "Confirmation", state: "upcoming" },
];

export default function RunPayrollOutlet() {
  const [rows, setRows] = useState(employees);

  const toggleRow = (id) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );

  const totals = useMemo(() => {
    const selected = rows.filter((r) => r.selected).map(computeRow);
    const gross = selected.reduce((s, r) => s + r.gross, 0);
    const deductions = selected.reduce((s, r) => s + r.deductions, 0);
    const statutory = selected.reduce((s, r) => s + r.statutory, 0);
    const loans = selected.reduce((s, r) => s + r.loanDeduction, 0);
    const net = selected.reduce((s, r) => s + r.net, 0);
    return {
      count: selected.length,
      gross,
      deductions,
      statutory,
      loans,
      net,
    };
  }, [rows]);

  const unresolvedCount = rows.filter((r) => r.flag).length;

  return (
    <div className="bg-white border border-[#eef0f5] rounded-[14px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6 border-b border-[#eef0f5]">
        <div>
          <div className="text-xs text-[#8a90a3] mb-1">
            Payroll / Run Payroll
          </div>
          <h2 className="m-0 text-lg font-bold text-[#3A3A3A]">
            Run Payroll — {payPeriod.range}
          </h2>
        </div>
        <Link
          to=".."
          className="text-sm font-semibold text-[#8a90a3] border border-[#eef0f5] rounded-[8px] px-4 py-2 hover:bg-gray-50"
        >
          Save &amp; exit
        </Link>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 md:px-6 border-b border-[#eef0f5]">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            {i > 0 && (
              <div
                className={`w-10 h-[1.5px] ${
                  step.state !== "upcoming" ? "bg-[#2AAF56]" : "bg-gray-200"
                }`}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-6.5 h-6.5 rounded-full text-xs font-bold shrink-0 ${
                  step.state === "done"
                    ? "bg-[#2AAF56] text-white"
                    : step.state === "active"
                      ? "bg-[#6675EC] text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {step.state === "done" ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={`text-sm ${
                  step.state === "active"
                    ? "font-bold text-[#3A3A3A]"
                    : step.state === "done"
                      ? "font-semibold text-[#8a90a3]"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Policy note */}
      <div className="mx-4 mt-4 md:mx-6 flex items-start gap-2.5 px-4 py-3 bg-[#6675EC]/10 rounded-[10px]">
        <Info className="w-4 h-4 text-[#6675EC] shrink-0 mt-0.5" />
        <span className="text-xs text-[#8a90a3] text-left leading-relaxed">
          Late deduction: 1 day's pay for every 3 lates logged this month (15-minute
          grace period). No overtime is paid. SSS, PhilHealth, and Pag-IBIG are
          withheld in full this cutoff; active loan installments are included below.
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 md:p-6">
        {/* Employee table */}
        <div className="flex-1 min-w-0 border border-[#eef0f5] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef0f5]">
            <div className="text-sm font-bold text-[#3A3A3A]">
              {totals.count} of {rows.length} employees selected
            </div>
            <div className="text-xs text-[#8a90a3]">
              {payPeriod.range} · Pay date {payPeriod.payDate}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-[#8a90a3]">
                  <th className="py-2 pl-4 pr-2 w-8"></th>
                  <th className="py-2 px-2 font-semibold">Employee</th>
                  <th className="py-2 px-2 font-semibold">Lates</th>
                  <th className="py-2 px-2 font-semibold">Gross pay</th>
                  <th className="py-2 px-2 font-semibold">Deductions</th>
                  <th className="py-2 pr-4 pl-2 font-semibold">Net pay</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const calc = computeRow(row);
                  return (
                    <tr
                      key={row.id}
                      className={`border-t border-[#eef0f5] hover:bg-gray-50 ${
                        row.flag ? "bg-[#EACA3A]/10" : ""
                      }`}
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRow(row.id)}
                          className="w-4 h-4 accent-[#6675EC]"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold shrink-0 ${row.color}`}
                          >
                            {row.initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#3A3A3A]">
                              {row.name}
                            </div>
                            {row.flag ? (
                              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8a6d10]">
                                <TriangleAlert className="w-3 h-3" />
                                {row.flag}
                              </div>
                            ) : (
                              <div className="text-[11px] text-[#8a90a3]">
                                {row.dept}
                                {row.loan ? ` · ${row.loan.type}` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm">{row.lates}</td>
                      <td className="py-3 px-2 text-sm">{money(calc.gross)}</td>
                      <td className="py-3 px-2 text-sm text-[#8a90a3]">
                        {money(calc.deductions)}
                      </td>
                      <td className="py-3 pr-4 pl-2 text-sm font-semibold">
                        {money(calc.net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary panel */}
        <div className="w-full lg:w-80 shrink-0 border border-[#eef0f5] rounded-[12px] p-5 h-fit">
          <div className="text-sm font-bold text-[#3A3A3A] mb-4">
            Pay run summary
          </div>

          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Gross pay</span>
              <span className="font-semibold">{money(totals.gross)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">SSS / PhilHealth / Pag-IBIG</span>
              <span className="font-semibold text-[#EC6668]">
                −{money(totals.statutory)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Loan deductions</span>
              <span className="font-semibold text-[#EC6668]">
                −{money(totals.loans)}
              </span>
            </div>
          </div>

          <div className="h-px bg-[#eef0f5] my-3.5" />

          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#3A3A3A]">Net pay</span>
            <span className="text-lg font-bold">{money(totals.net)}</span>
          </div>

          {unresolvedCount > 0 && (
            <div className="flex items-start gap-2.5 mt-4 p-3 rounded-[8px] bg-[#EACA3A]/15">
              <TriangleAlert className="w-4 h-4 text-[#8a6d10] shrink-0 mt-0.5" />
              <span className="text-xs text-[#8a6d10] text-left leading-relaxed">
                {unresolvedCount} employee{unresolvedCount > 1 ? "s have" : " has"}{" "}
                3 or more lates this cutoff. Review before approving.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 flex items-center justify-between px-4 py-4 md:px-6 border-t border-[#eef0f5] bg-white">
        <Link
          to=".."
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8a90a3] border border-[#eef0f5] rounded-[8px] px-4 py-2.5 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to hours
        </Link>
        <div className="text-sm text-[#8a90a3] hidden md:block">
          {totals.count} of {rows.length} employees selected
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-[#6675EC] hover:bg-[#5563d6] text-white text-sm font-semibold rounded-[10px] px-5 py-2.5 transition-colors"
        >
          Continue to approval
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
