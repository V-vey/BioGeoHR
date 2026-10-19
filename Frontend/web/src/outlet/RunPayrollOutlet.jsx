import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "@/resources/api";
import { notifySuccess, notifyError } from "@/lib/dialog";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  TriangleAlert,
  Info,
} from "lucide-react";
import { paydayFor } from "@/lib/payday";

const money = (n) =>
  Number(n || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

const pad = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// default = the current cutoff: 1–15 or 16–end of month
const defaultPeriod = () => {
  const t = new Date();
  const y = t.getFullYear();
  const m = t.getMonth();
  if (t.getDate() <= 15) return [toISO(y, m, 1), toISO(y, m, 15)];
  return [toISO(y, m, 16), toISO(y, m, new Date(y, m + 1, 0).getDate())];
};

const PAGE_SIZE = 10; // employees shown per page

// the school pays two cutoffs a month, so HR picks a month and which half; the dates follow from that
const periodOf = (month, half) => {
  if (!month) return { periodStart: "", periodEnd: "" };
  const [y, m] = month.split("-").map(Number);
  if (half === "first") {
    return { periodStart: toISO(y, m - 1, 1), periodEnd: toISO(y, m - 1, 15) };
  }
  return {
    periodStart: toISO(y, m - 1, 16),
    periodEnd: toISO(y, m - 1, new Date(y, m, 0).getDate()),
  };
};

const steps = [
  { label: "Select period", state: "done" },
  { label: "Review pay", state: "active" },
  { label: "Run payroll", state: "upcoming" },
];

export default function RunPayrollOutlet() {
  const navigate = useNavigate();
  const [start] = defaultPeriod();
  const [month, setMonth] = useState(start.slice(0, 7)); // "2026-11"
  const [half, setHalf] = useState(
    Number(start.slice(8)) <= 15 ? "first" : "second",
  );
  const { periodStart, periodEnd } = periodOf(month, half);
  const [rows, setRows] = useState([]);
  const [excluded, setExcluded] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const headers = {
    "ngrok-skip-browser-warning": "true",
  };

  useEffect(() => {
    if (!periodStart || !periodEnd) return;
    let cancelled = false;
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          url + "/payslips/preview",
          { period_start: periodStart, period_end: periodEnd },
          { headers },
        );
        if (cancelled) return;
        setRows(res.data);
        setExcluded([]);
        setPage(1);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to load payroll preview:", error);
        setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [periodStart, periodEnd]);

  const toggleRow = (id) =>
    setExcluded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // select all / unselect all covers every employee on every page, not only the ones on screen
  const allSelected = rows.length > 0 && excluded.length === 0;
  const noneSelected = rows.length > 0 && excluded.length === rows.length;
  const toggleAll = () =>
    setExcluded(allSelected ? rows.map((r) => r.user_id) : []);

  const lastPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const firstShown = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = Math.min(page * PAGE_SIZE, rows.length);
  const visibleRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleRun = async () => {
    try {
      const res = await axios.post(
        url + "/payslips/run",
        {
          period_start: periodStart,
          period_end: periodEnd,
          excluded_ids: excluded,
        },
        { headers },
      );
      notifySuccess(res.data.message, "Payroll run");
      navigate(`/payroll/payslips?start=${periodStart}&end=${periodEnd}`);
    } catch (error) {
      notifyError(
        "Something went wrong while running payroll.",
        "Payroll not run",
      );
    }
  };

  const govt = (r) => Number(r.sss) + Number(r.philhealth) + Number(r.pagibig);

  const totals = useMemo(() => {
    const t = {
      count: 0,
      gross: 0,
      gov: 0,
      tax: 0,
      late: 0,
      absent: 0,
      loan: 0,
      net: 0,
      overtime: 0,
      additional: 0,
    };
    rows
      .filter((r) => !excluded.includes(r.user_id))
      .forEach((r) => {
        t.count += 1;
        t.gross += Number(r.gross_salary);
        t.gov += govt(r);
        t.tax += Number(r.income_tax);
        t.late += Number(r.late_deduction);
        t.absent += Number(r.absence_deduction);
        t.loan += Number(r.loan_deduction);
        t.net += Number(r.net_pay);
        // overtime Comment
        t.overtime += Number(r.overtime_pay);
        t.additional += Number(r.additional_pay);
      });
    return t;
  }, [rows, excluded]);

  const lateCount = rows.filter((r) => Number(r.late_deduction) > 0).length;
  const absentCount = rows.filter((r) => Number(r.absent_days) > 0).length;

  return (
    <div className="bg-white border border-[#eef0f5] rounded-[14px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6 border-b border-[#eef0f5]">
        <div>
          <div className="text-xs text-[#8a90a3] mb-1">
            Payroll / Run Payroll
          </div>
          <h2 className="m-0 text-lg font-bold text-[#3A3A3A]">Run Payroll</h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-[#b2b2b2] rounded-[8px] px-2 py-1"
          />
          <select
            value={half}
            onChange={(e) => setHalf(e.target.value)}
            className="border border-[#b2b2b2] rounded-[8px] px-2 py-1"
          >
            <option value="first">1st – 15th</option>
            <option value="second">16th – end of month</option>
          </select>
        </div>
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
                {step.state === "done" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  i + 1
                )}
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
          Late deduction: 1 day's pay after 3 lates this month. Absence
          deduction: 1 day's pay for each day marked Absent (approved leave and
          holidays are not counted). SSS, PhilHealth, Pag-IBIG and BIR income
          tax are withheld. Loan installments are deducted on the first cutoff.
        </span>
      </div>

      <div className="flex flex-col 2xl:flex-row gap-4 p-4 md:p-6">
        {/* Employee table */}
        <div className="flex-1 min-w-0 border border-[#eef0f5] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#eef0f5]">
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-[#3A3A3A]">
                {totals.count} of {rows.length} employees selected
              </div>
              <button
                type="button"
                onClick={toggleAll}
                disabled={rows.length === 0}
                className="text-xs font-semibold text-[#6675EC] hover:underline disabled:opacity-40 disabled:no-underline"
              >
                {allSelected ? "Unselect all" : "Select all"}
              </button>
            </div>
            <div className="text-xs text-[#8a90a3] text-right">
              <div>
                {periodStart} to {periodEnd}
              </div>
              <div className="font-semibold text-[#3A3A3A]">
                Payday {paydayFor(periodStart)}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-[#8a90a3]">
                  <th className="py-2 pl-4 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = !allSelected && !noneSelected;
                      }}
                      onChange={toggleAll}
                      disabled={rows.length === 0}
                      title={allSelected ? "Unselect all" : "Select all"}
                      className="w-4 h-4 accent-[#6675EC]"
                    />
                  </th>
                  <th className="py-2 px-2 font-semibold">Employee</th>
                  <th className="py-2 px-2 font-semibold">Gross</th>
                  <th className="py-2 px-2 font-semibold">Gov't</th>
                  <th className="py-2 px-2 font-semibold">Tax</th>
                  <th className="py-2 px-2 font-semibold">Late</th>
                  <th className="py-2 px-2 font-semibold">Absent</th>
                  <th className="py-2 px-2 font-semibold">Loan</th>
                  {/* overtime Comment */}
                  {/* <th className="py-2 px-2 font-semibold">Overtime Pay</th> */}
                  <th className="py-2 px-2 font-semibold">Additional Pay</th>
                  <th className="py-2 pr-4 pl-2 font-semibold">Net pay</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-6 text-center text-sm text-[#8a90a3]"
                    >
                      Loading preview...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-6 text-center text-sm text-[#8a90a3]"
                    >
                      No employees to pay for this period.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((r) => {
                    const hasLate = Number(r.late_deduction) > 0;
                    const absentDays = Number(r.absent_days) || 0;
                    return (
                      <tr
                        key={r.user_id}
                        className={`border-t border-[#eef0f5] hover:bg-gray-50 ${
                          hasLate ? "bg-[#EACA3A]/10" : ""
                        }`}
                      >
                        <td className="py-3 pl-4 pr-2">
                          <input
                            type="checkbox"
                            checked={!excluded.includes(r.user_id)}
                            onChange={() => toggleRow(r.user_id)}
                            className="w-4 h-4 accent-[#6675EC]"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm font-semibold text-[#3A3A3A]">
                            {r.name}
                          </div>
                          {hasLate && (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8a6d10]">
                              <TriangleAlert className="w-3 h-3" />
                              Late deduction applied
                            </div>
                          )}
                          {absentDays > 0 && (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#EC6668]">
                              <TriangleAlert className="w-3 h-3" />
                              Absent {absentDays} day{absentDays > 1 ? "s" : ""}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {money(r.gross_salary)}
                        </td>
                        <td className="py-3 px-2 text-sm">{money(govt(r))}</td>
                        <td className="py-3 px-2 text-sm">
                          {money(r.income_tax)}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {money(r.late_deduction)}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {money(r.absence_deduction)}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {money(r.loan_deduction)}
                        </td>
                        {/* overtime Comment */}
                        {/* <td className="py-3 px-2 text-sm">
                          {money(r.overtime_pay)}
                        </td> */}
                        <td className="py-3 px-2 text-sm">
                          {money(r.additional_pay)}
                        </td>

                        <td className="py-3 pr-4 pl-2 text-sm font-semibold">
                          {money(r.net_pay)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#eef0f5] text-sm text-[#8a90a3] select-none">
              <span>
                Showing {firstShown}–{lastShown} of {rows.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-[8px] border border-[#b2b2b2] text-[#3A3A3A] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {lastPage}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="px-3 py-1 rounded-[8px] border border-[#b2b2b2] text-[#3A3A3A] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary panel */}
        <div className="w-full 2xl:w-80 shrink-0 border border-[#eef0f5] rounded-[12px] p-5 h-fit">
          <div className="text-sm font-bold text-[#3A3A3A] mb-4">
            Pay run summary
          </div>
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Gross pay</span>
              <span className="font-semibold">{money(totals.gross)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">
                SSS / PhilHealth / Pag-IBIG
              </span>
              <span className="font-semibold text-[#EC6668]">
                −{money(totals.gov)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Income tax</span>
              <span className="font-semibold text-[#EC6668]">
                −{money(totals.tax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Late deductions</span>
              <span className="font-semibold text-[#EC6668]">
                −{money(totals.late)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Absence deductions</span>
              <span className="font-semibold text-[#EC6668]">
                −{money(totals.absent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Loan deductions</span>
              <span className="font-semibold text-[#EC6668]">
                −{money(totals.loan)}
              </span>
            </div>

            {/* overtime Comment */}
            {/* <div className="flex justify-between">
              <span className="text-[#8a90a3]">Overtime Pay</span>
              <span className="font-semibold">{money(totals.overtime)}</span>
            </div> */}

            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Additional Pay</span>
              <span className="font-semibold">{money(totals.additional)}</span>
            </div>
          </div>
          <div className="h-px bg-[#eef0f5] my-3.5" />
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#3A3A3A]">Net pay</span>
            <span className="text-lg font-bold">{money(totals.net)}</span>
          </div>
          {lateCount > 0 && (
            <div className="flex items-start gap-2.5 mt-4 p-3 rounded-[8px] bg-[#EACA3A]/15">
              <TriangleAlert className="w-4 h-4 text-[#8a6d10] shrink-0 mt-0.5" />
              <span className="text-xs text-[#8a6d10] text-left leading-relaxed">
                {lateCount} employee{lateCount > 1 ? "s have" : " has"} a late
                deduction this period. Review before running.
              </span>
            </div>
          )}
          {absentCount > 0 && (
            <div className="flex items-start gap-2.5 mt-4 p-3 rounded-[8px] bg-[#EC6668]/10">
              <TriangleAlert className="w-4 h-4 text-[#EC6668] shrink-0 mt-0.5" />
              <span className="text-xs text-[#EC6668] text-left leading-relaxed">
                {absentCount} employee{absentCount > 1 ? "s have" : " has"} an
                absence deduction this period. Review before running.
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
          Back to overview
        </Link>
        <div className="text-sm text-[#8a90a3] hidden md:block">
          {totals.count} of {rows.length} employees selected
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={loading || totals.count === 0}
          className="inline-flex items-center gap-2 bg-[#6675EC] hover:bg-[#5563d6] disabled:opacity-40 text-white text-sm font-semibold rounded-[10px] px-5 py-2.5 transition-colors"
        >
          Run Payroll
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
