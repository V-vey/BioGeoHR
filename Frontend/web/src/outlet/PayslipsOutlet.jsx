import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { url } from "@/resources/api";
import { Printer, ChevronDown } from "lucide-react";
import Loading from "@/components/Loading";

const company = {
  name: "Academia de Santiago of Tarlac, Inc.",
  address: "Brgy. San Vicente",
  cityState: "Tarlac City, Tarlac",
};

const money = (n) =>
  Number(n || 0).toLocaleString("en-PH", { style: "currency", currency: "PHP" });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const periodKey = (p) => `${p.period_start}_${p.period_end}`;
const periodLabel = (p) =>
  `${fmtDate(p.period_start)} – ${fmtDate(p.period_end)}`;

// gross_salary is stored as the monthly salary; one payslip covers half of it.
const halfGross = (p) => Number(p.gross_salary) / 2;
// SSS, PhilHealth, Pag-IBIG and the late deduction are monthly amounts, and each
// semi-monthly payslip carries half of them.
const half = (n) => Number(n) / 2;

function buildSlip(p) {
  const gross = halfGross(p);
  const lines = [
    { label: "SSS Contribution", amount: half(p.sss) },
    { label: "PhilHealth Contribution", amount: half(p.philhealth) },
    { label: "Pag-IBIG Contribution", amount: half(p.pagibig) },
    { label: "Withholding Tax (BIR)", amount: Number(p.income_tax) },
    { label: "Late Deduction", amount: half(p.late_deduction) },
    { label: "Loan Deduction", amount: Number(p.loan_deduction) },
  ].filter((l) => l.amount > 0);

  const net = Number(p.net_pay);
  const totalDeductions = Math.max(0, gross - net);
  const listed = lines.reduce((s, l) => s + l.amount, 0);
  const other = totalDeductions - listed;
  if (Math.abs(other) > 0.01) {
    lines.push({ label: "Other adjustments", amount: other });
  }
  return { gross, lines, totalDeductions, net };
}

export default function PayslipsOutlet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchPayslips = async () => {
      try {
        const response = await axios.get(url + "/payslips", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setPayslips(response.data);
      } catch (error) {
        console.error("Failed to load payslips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const periods = useMemo(() => {
    const seen = {};
    payslips.forEach((p) => {
      seen[periodKey(p)] = {
        period_start: p.period_start,
        period_end: p.period_end,
      };
    });
    return Object.values(seen).sort(
      (a, b) => new Date(b.period_start) - new Date(a.period_start),
    );
  }, [payslips]);

  const wanted = `${searchParams.get("start")}_${searchParams.get("end")}`;
  const period =
    periods.find((p) => periodKey(p) === wanted) ?? periods[0] ?? null;

  const inPeriod = useMemo(
    () =>
      period
        ? payslips
            .filter((p) => periodKey(p) === periodKey(period))
            .sort((a, b) =>
              (a.user?.name ?? "").localeCompare(b.user?.name ?? ""),
            )
        : [],
    [payslips, period],
  );

  const current =
    inPeriod.find((p) => p.user_id === employeeId) ?? inPeriod[0] ?? null;

  const slip = current ? buildSlip(current) : null;

  const ytd = useMemo(() => {
    if (!current) return null;
    const year = new Date(current.period_end).getFullYear();
    const mine = payslips.filter(
      (p) =>
        p.user_id === current.user_id &&
        new Date(p.period_end).getFullYear() === year &&
        new Date(p.period_end) <= new Date(current.period_end),
    );
    const gross = mine.reduce((s, p) => s + halfGross(p), 0);
    const net = mine.reduce((s, p) => s + Number(p.net_pay), 0);
    return { gross, deductions: Math.max(0, gross - net), net };
  }, [payslips, current]);

  const choosePeriod = (key) => {
    const [start, end] = key.split("_");
    setSearchParams({ start, end });
    setEmployeeId(null);
  };

  const selectClass =
    "appearance-none bg-white border border-[#eef0f5] rounded-[8px] pl-3.5 pr-8 py-2.5 text-sm font-medium text-[#3A3A3A] hover:bg-gray-50";

  return (
    <div className="flex justify-center">
      {loading && <Loading />}
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-left">
            <h2 className="m-0 text-lg font-bold text-[#3A3A3A]">Payslips</h2>
            <div className="text-sm text-[#8a90a3] mt-1">
              View and print pay history
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={period ? periodKey(period) : ""}
                onChange={(e) => choosePeriod(e.target.value)}
                className={selectClass}
              >
                {periods.map((p) => (
                  <option key={periodKey(p)} value={periodKey(p)}>
                    {periodLabel(p)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8a90a3] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={current?.user_id ?? ""}
                onChange={(e) => setEmployeeId(Number(e.target.value))}
                className={selectClass}
              >
                {inPeriod.map((p) => (
                  <option key={p.id} value={p.user_id}>
                    {p.user?.name ?? `Employee ${p.user_id}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8a90a3] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!current}
              className="flex items-center gap-2 bg-[#6675EC] hover:bg-[#5563d6] disabled:opacity-40 text-white text-sm font-semibold rounded-[8px] px-4 py-2.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </div>

        {!current ? (
          <div className="bg-white border border-[#eef0f5] rounded-[14px] px-6 py-10 text-sm text-[#8a90a3]">
            {loading ? "" : "No payslips yet. Run payroll to generate them."}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Payslip document */}
            <div className="flex-1 min-w-0 w-full bg-white border border-[#eef0f5] rounded-[14px] px-6 py-7 md:px-9 md:py-8 text-left">
              <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 border-b border-[#eef0f5]">
                <div>
                  <div className="font-bold text-[#3A3A3A]">{company.name}</div>
                  <div className="text-xs text-[#8a90a3] mt-1 leading-relaxed">
                    {company.address}
                    <br />
                    {company.cityState}
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="font-bold text-[#3A3A3A]">
                    {current.user?.name}
                  </div>
                  <div className="text-xs text-[#8a90a3] mt-1 leading-relaxed">
                    Employee ID: {current.user_id}
                    <br />
                    {current.user?.department} · {current.user?.position}
                    {current.user?.contract_type
                      ? ` · ${current.user.contract_type}`
                      : ""}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 py-5">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                    Pay period
                  </div>
                  <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                    {periodLabel(current)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                    Generated on
                  </div>
                  <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                    {fmtDate(current.created_at)}
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="text-sm font-bold text-[#3A3A3A] mb-2">
                Earnings
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-t border-[#eef0f5]">
                    <td className="py-2.5 text-sm">
                      Basic salary (semi-monthly)
                    </td>
                    <td className="py-2.5 text-sm text-right">
                      {money(slip.gross)}
                    </td>
                  </tr>
                  {/* overtime Comment
                  <tr className="border-t border-[#eef0f5]">
                    <td className="py-2.5 text-sm">Overtime pay</td>
                    <td className="py-2.5 text-sm text-right">{money(current.overtime_pay)}</td>
                  </tr>
                  */}
                  <tr className="border-t border-[#eef0f5] font-bold">
                    <td className="py-2.5 text-sm">Total earnings</td>
                    <td className="py-2.5 text-sm text-right">
                      {money(slip.gross)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Deductions */}
              <div className="text-sm font-bold text-[#3A3A3A] mb-2 mt-6">
                Deductions
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {slip.lines.map((d) => (
                    <tr key={d.label} className="border-t border-[#eef0f5]">
                      <td className="py-2 text-sm text-[#8a90a3]">{d.label}</td>
                      <td className="py-2 text-sm text-right">
                        {money(d.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-[#eef0f5] font-bold">
                    <td className="py-2.5 text-sm">Total deductions</td>
                    <td className="py-2.5 text-sm text-right">
                      {money(slip.totalDeductions)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Net pay */}
              <div className="flex items-center justify-between mt-6 px-5 py-4 rounded-[10px] bg-[#2AAF56]/10">
                <span className="text-sm font-bold text-[#3A3A3A]">
                  Net pay
                </span>
                <span className="text-2xl font-bold text-[#2AAF56]">
                  {money(slip.net)}
                </span>
              </div>
            </div>

            {/* Side column */}
            <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
              <div className="bg-white border border-[#eef0f5] rounded-[14px] p-5 text-left">
                <div className="text-sm font-bold text-[#3A3A3A] mb-3.5">
                  Year-to-date
                </div>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8a90a3]">Gross pay</span>
                    <span className="font-semibold">{money(ytd.gross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a90a3]">Deductions</span>
                    <span className="font-semibold">
                      {money(ytd.deductions)}
                    </span>
                  </div>
                  <div className="h-px bg-[#eef0f5] my-0.5" />
                  <div className="flex justify-between">
                    <span className="font-bold text-[#3A3A3A]">Net pay</span>
                    <span className="font-bold">{money(ytd.net)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
