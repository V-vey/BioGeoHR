import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import { Plus, CircleOff, Landmark, Wallet, Info } from "lucide-react";
import StatusBadge from "@/components/Payroll/StatusBadge";
import Loading from "@/components/Loading";

const LOAN_TYPES = ["SSS", "Pag-IBIG", "Company", "Cash Advance"];

const peso = (n) =>
  "₱" +
  Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0 });

const initials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const emptyForm = {
  user_id: "",
  loan_type: "SSS",
  total_amount: "",
  monthly_deduction: "",
  start_date: "",
};

function NewLoanModal({ employees, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      setSaving(true);
      await axios.post(url + "/loans", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      alert("Loan created");
      onSaved();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message ?? "Could not create the loan.");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full border border-[#b2b2b2] rounded-[10px] p-2 bg-white";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-white rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="font-bold text-left">New loan</h2>

        <label className="text-left text-sm font-medium">
          Employee
          <select
            required
            value={form.user_id}
            onChange={update("user_id")}
            className={fieldClass}
          >
            <option value="" disabled>
              Select an employee
            </option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-left text-sm font-medium">
          Loan type
          <select
            value={form.loan_type}
            onChange={update("loan_type")}
            className={fieldClass}
          >
            {LOAN_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="text-left text-sm font-medium">
          Total amount
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.total_amount}
            onChange={update("total_amount")}
            className={fieldClass}
          />
        </label>

        <label className="text-left text-sm font-medium">
          Monthly deduction
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.monthly_deduction}
            onChange={update("monthly_deduction")}
            className={fieldClass}
          />
        </label>

        <label className="text-left text-sm font-medium">
          Start date
          <input
            required
            type="date"
            value={form.start_date}
            onChange={update("start_date")}
            className={fieldClass}
          />
        </label>

        <div className="flex flex-row gap-2 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded-full border border-[#b2b2b2]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1 rounded-full text-white bg-[#2AAF56] hover:bg-[#6675EC] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoansOutlet() {
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const fetchLoans = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(url + "/loans", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setRows(response.data);
    } catch (error) {
      console.error("Failed to load loans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    const token = localStorage.getItem("token");
    axios
      .get(url + "/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      })
      .then((res) => setEmployees(res.data))
      .catch((error) => console.error("Failed to load employees:", error));
  }, []);

  const activeCount = rows.filter((l) => l.status === "Active").length;
  const paidCount = rows.filter((l) => l.status === "Paid").length;
  const totalOutstanding = rows
    .filter((l) => l.status === "Active")
    .reduce((s, l) => s + Number(l.remaining_balance), 0);

  return (
    <div className="flex flex-col gap-4">
      {loading && <Loading />}

      {/* Stat row */}
      <div className="flex w-full justify-between gap-4">
        <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
          <div className="font-medium text-[#6675EC] text-left">
            Active Loans
          </div>
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
            Fully Paid
          </div>
          <div className="flex items-start justify-between">
            <span className="text-[24px] font-regular text-[#3A3A3A]">
              {paidCount}
            </span>
            <CircleOff className="text-[#EACA3A] w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Policy note */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-[#6675EC]/10 rounded-[10px]">
        <Info className="w-4 h-4 text-[#6675EC] shrink-0 mt-0.5" />
        <span className="text-xs text-[#8a90a3] text-left leading-relaxed">
          Loans are interest-free with a fixed monthly deduction, taken once a
          month on the second cutoff (the 16th onward). An employee may hold
          only one active loan or cash advance at a time — a new one can't be
          issued until the existing balance is fully paid off. If net pay can't
          cover the deduction, a partial amount is taken. When a balance reaches
          ₱0, the system marks the loan Paid and stops the deduction.
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
              SSS, Pag-IBIG, company loans, and cash advances — all tracked the
              same way
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNew(true)}
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
                <th className="py-2 px-3 font-semibold">Started</th>
                <th className="py-2 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-sm text-[#8a90a3]"
                  >
                    No loans yet.
                  </td>
                </tr>
              ) : (
                rows.map((loan) => (
                  <tr
                    key={loan.id}
                    className="border-t border-[#eef0f5] hover:bg-gray-50"
                  >
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold shrink-0 bg-[#6675EC]">
                          {initials(loan.user?.name)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#3A3A3A]">
                            {loan.user?.name ?? "Unknown employee"}
                          </div>
                          <div className="text-[11px] text-[#8a90a3]">
                            {loan.user?.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-[#8a90a3]">
                      {loan.loan_type}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {peso(loan.total_amount)}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {peso(loan.monthly_deduction)}
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold">
                      {peso(loan.remaining_balance)}
                    </td>
                    <td className="py-3 px-3 text-sm text-[#8a90a3]">
                      {loan.start_date}
                    </td>
                    <td className="py-3 px-3">
                      {loan.status === "Active" ? (
                        <StatusBadge tone="success">Active</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">Paid</StatusBadge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <NewLoanModal
          employees={employees}
          onClose={() => setShowNew(false)}
          onSaved={fetchLoans}
        />
      )}
    </div>
  );
}
