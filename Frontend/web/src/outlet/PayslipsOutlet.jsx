import { useState } from "react";
import { Download, ChevronDown, Landmark } from "lucide-react";

// Sample data for now — swap for an API call once the payroll endpoints exist.
// Numbers match Maria Santos's row on the Jan 1–15, 2026 Run Payroll screen:
// monthly salary ₱16,000 → daily rate 16,000/26 = ₱615.38, gross = 16,000/2 = ₱8,000.
const payslip = {
  employee: {
    name: "Maria Santos",
    id: "MR-0001",
    dept: "Teaching Staff · Regular",
  },
  company: {
    name: "Academia de Santiago of Tarlac, Inc.",
    address: "Brgy. San Vicente",
    cityState: "Tarlac City, Tarlac",
  },
  period: "Jan 1 – Jan 15, 2026",
  payDate: "Jan 20, 2026",
  payMethod: "Bank deposit",
  earnings: [{ label: "Regular salary (semi-monthly)", hours: null, rate: null, amount: 8000.0 }],
  totalEarnings: 8000.0,
  deductions: [
    { label: "SSS Contribution", amount: 800.0 },
    { label: "PhilHealth Contribution", amount: 400.0 },
    { label: "Pag-IBIG Contribution", amount: 400.0 },
    { label: "SSS Loan", amount: 2000.0 },
  ],
  totalDeductions: 3600.0,
  netPay: 4400.0,
  ytd: { gross: 16000.0, deductions: 7200.0, net: 8800.0 },
  bank: { last4: "5521", type: "Savings", sentOn: "Jan 20, 2026" },
};

const money = (n) =>
  n.toLocaleString("en-PH", { style: "currency", currency: "PHP" });

export default function PayslipsOutlet() {
  const [period] = useState(payslip.period);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-left">
            <h2 className="m-0 text-lg font-bold text-[#3A3A3A]">Payslips</h2>
            <div className="text-sm text-[#8a90a3] mt-1">
              View and download pay history
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 bg-white border border-[#eef0f5] rounded-[8px] px-3.5 py-2.5 text-sm font-medium text-[#3A3A3A] hover:bg-gray-50"
            >
              Pay period: {period}
              <ChevronDown className="w-3.5 h-3.5 text-[#8a90a3]" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 bg-[#6675EC] hover:bg-[#5563d6] text-white text-sm font-semibold rounded-[8px] px-4 py-2.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* Payslip document */}
          <div className="flex-1 min-w-0 w-full bg-white border border-[#eef0f5] rounded-[14px] px-6 py-7 md:px-9 md:py-8 text-left">
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-5 border-b border-[#eef0f5]">
              <div>
                <div className="font-bold text-[#3A3A3A]">
                  {payslip.company.name}
                </div>
                <div className="text-xs text-[#8a90a3] mt-1 leading-relaxed">
                  {payslip.company.address}
                  <br />
                  {payslip.company.cityState}
                </div>
              </div>
              <div className="sm:text-right">
                <div className="font-bold text-[#3A3A3A]">
                  {payslip.employee.name}
                </div>
                <div className="text-xs text-[#8a90a3] mt-1 leading-relaxed">
                  Employee ID: {payslip.employee.id}
                  <br />
                  {payslip.employee.dept}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 py-5">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                  Pay period
                </div>
                <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                  {payslip.period}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                  Pay date
                </div>
                <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                  {payslip.payDate}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                  Pay method
                </div>
                <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                  {payslip.payMethod}
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div className="text-sm font-bold text-[#3A3A3A] mb-2">
              Earnings
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-[#8a90a3]">
                  <th className="py-2 font-semibold">Description</th>
                  <th className="py-2 font-semibold text-right">Hours</th>
                  <th className="py-2 font-semibold text-right">Rate</th>
                  <th className="py-2 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payslip.earnings.map((e) => (
                  <tr key={e.label} className="border-t border-[#eef0f5]">
                    <td className="py-2.5 text-sm">{e.label}</td>
                    <td className="py-2.5 text-sm text-right text-[#8a90a3]">
                      {e.hours ?? "—"}
                    </td>
                    <td className="py-2.5 text-sm text-right text-[#8a90a3]">
                      {e.rate ?? "—"}
                    </td>
                    <td className="py-2.5 text-sm text-right">
                      {money(e.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-[#eef0f5] font-bold">
                  <td className="py-2.5 text-sm">Total earnings</td>
                  <td></td>
                  <td></td>
                  <td className="py-2.5 text-sm text-right">
                    {money(payslip.totalEarnings)}
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
                {payslip.deductions.map((d) => (
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
                    {money(payslip.totalDeductions)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Net pay */}
            <div className="flex items-center justify-between mt-6 px-5 py-4 rounded-[10px] bg-[#2AAF56]/10">
              <span className="text-sm font-bold text-[#3A3A3A]">Net pay</span>
              <span className="text-2xl font-bold text-[#2AAF56]">
                {money(payslip.netPay)}
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
                  <span className="font-semibold">{money(payslip.ytd.gross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a90a3]">Deductions</span>
                  <span className="font-semibold">
                    {money(payslip.ytd.deductions)}
                  </span>
                </div>
                <div className="h-px bg-[#eef0f5] my-0.5" />
                <div className="flex justify-between">
                  <span className="font-bold text-[#3A3A3A]">Net pay</span>
                  <span className="font-bold">{money(payslip.ytd.net)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#eef0f5] rounded-[14px] p-5 text-left">
              <div className="text-sm font-bold text-[#3A3A3A] mb-3.5">
                Bank deposit
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[#6675EC]/10 shrink-0">
                  <Landmark className="w-4.5 h-4.5 text-[#6675EC]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#3A3A3A]">
                    {payslip.bank.type} ····{payslip.bank.last4}
                  </div>
                  <div className="text-xs text-[#8a90a3] mt-0.5">
                    Sent {payslip.bank.sentOn}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
