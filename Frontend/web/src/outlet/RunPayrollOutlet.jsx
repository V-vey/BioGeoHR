import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { url } from "@/resources/api";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  TriangleAlert,
  Info,
} from "lucide-react";

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

const steps = [
  { label: "Select period", state: "done" },
  { label: "Review pay", state: "active" },
  { label: "Run payroll", state: "upcoming" },
];

export default function RunPayrollOutlet() {
  const navigate = useNavigate();
  const [start, end] = defaultPeriod();
  const [periodStart, setPeriodStart] = useState(start);
  const [periodEnd, setPeriodEnd] = useState(end);
  const [rows, setRows] = useState([]);
  const [excluded, setExcluded] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
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
      alert(res.data.message);
      navigate(`/payroll/payslips?start=${periodStart}&end=${periodEnd}`);
    } catch (error) {
      alert("Something went wrong while running payroll.");
    }
  };

  const govt = (r) => Number(r.sss) + Number(r.philhealth) + Number(r.pagibig);

  const totals = useMemo(() => {
    const t = { count: 0, gross: 0, gov: 0, tax: 0, late: 0, loan: 0, net: 0 };
    rows
      .filter((r) => !excluded.includes(r.user_id))
      .forEach((r) => {
        t.count += 1;
        t.gross += Number(r.gross_salary);
        t.gov += govt(r);
        t.tax += Number(r.income_tax);
        t.late += Number(r.late_deduction);
        t.loan += Number(r.loan_deduction);
        t.net += Number(r.net_pay);
        // overtime Comment
        // t.overtime += Number(r.overtime_pay);
      });
    return t;
  }, [rows, excluded]);

  const lateCount = rows.filter((r) => Number(r.late_deduction) > 0).length;

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
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="border border-[#b2b2b2] rounded-[8px] px-2 py-1"
          />
          <span className="text-[#8a90a3]">to</span>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="border border-[#b2b2b2] rounded-[8px] px-2 py-1"
          />
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
          Late deduction: 1 day's pay after 3 lates this month. SSS, PhilHealth,
          Pag-IBIG and BIR income tax are withheld. Loan installments are
          deducted on the second cutoff.
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
              {periodStart} to {periodEnd}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-[#8a90a3]">
                  <th className="py-2 pl-4 pr-2 w-8"></th>
                  <th className="py-2 px-2 font-semibold">Employee</th>
                  <th className="py-2 px-2 font-semibold">Gross</th>
                  <th className="py-2 px-2 font-semibold">Gov't</th>
                  <th className="py-2 px-2 font-semibold">Tax</th>
                  <th className="py-2 px-2 font-semibold">Late</th>
                  <th className="py-2 px-2 font-semibold">Loan</th>
                  {/* overtime Comment
                  <th className="py-2 px-2 font-semibold">Overtime</th>
                  */}

                  <th className="py-2 pr-4 pl-2 font-semibold">Net pay</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-6 text-center text-sm text-[#8a90a3]"
                    >
                      Loading preview...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-6 text-center text-sm text-[#8a90a3]"
                    >
                      No employees to pay for this period.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const hasLate = Number(r.late_deduction) > 0;
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
                          {money(r.loan_deduction)}
                        </td>
                        {/* overtime Comment
                        <td className="py-3 px-2 text-sm">
                          {money(r.overtime_pay)}
                        </td>
                        */}

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
              <span className="text-[#8a90a3]">Loan deductions</span>
              <span className="font-semibold text-[#EC6668]">
                −{money(totals.loan)}
              </span>
            </div>

            {/* overtime Comment
            <div className="flex justify-between">
              <span className="text-[#8a90a3]">Overtime</span>
              <span className="font-semibold">{money(totals.overtime)}</span>
            </div>
            */}
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
