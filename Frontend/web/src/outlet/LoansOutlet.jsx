import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import { notifySuccess, notifyError } from "@/lib/dialog";
import { Plus, CircleOff, Landmark, Wallet, Info } from "lucide-react";
import StatusBadge from "@/components/Payroll/StatusBadge";
import Loading from "@/components/Loading";
import Containers from "@/components/container";
import AuthImage from "@/components/AuthImage";
import Fallback from "@/assets/user.svg";
import {
  predictLoanEnd,
  predictRunningLoanEnd,
  cutoffLabel,
  monthLabel,
  dateLabel,
  SCHOOL_YEAR_TYPES,
  MAX_DEDUCTIONS,
} from "@/lib/loanEnd";
import DateInput from "@/components/DateInput";

const LOAN_TYPES = ["SSS", "Pag-IBIG", "Company", "Cash Advance"];

const peso = (n) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0 });

// The employee's photo, or the grey silhouette when there is none or it cannot be loaded:
// the same round picture as on the All Employee page.
function Avatar({ user }) {
  return (
    <div className="flex rounded-full w-10 h-10 border items-center overflow-hidden shrink-0">
      <AuthImage
        src={user?.image_path ? `${url}/${user.image_path}` : null}
        fallback={Fallback}
        alt={`${user?.name || "Employee"}'s photo`}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

const emptyForm = {
  user_id: "",
  loan_type: "SSS",
  total_amount: "",
  monthly_deduction: "",
  cutoff: "second", // the school allows either cutoff; a new loan starts as 16th-end (the school's usual "every 5th"). "first" = 1st-15th, "both" = half in each
  start_date: "",
};

// The line under the form: how many deductions, when the last one is, and whether it fits the school year.
function LoanEndNote({ form, schoolYearEnd }) {
  const p = predictLoanEnd({
    amount: form.total_amount,
    monthly: form.monthly_deduction,
    startDate: form.start_date,
    type: form.loan_type,
    schoolYearEnd,
    cutoff: form.cutoff,
  });
  if (!p) return null;

  const endText = schoolYearEnd ? dateLabel(schoolYearEnd) : "";
  let tone = "bg-[#6675EC]/10 text-[#3A3A3A]";
  let verdict = null;
  // the same order as the backend: the school-year message first, then the length limit
  if (p.checked && p.available === 0) {
    tone = "bg-[#EC6668]/10 text-[#3A3A3A]";
    verdict = `The first deduction would be after the school year ends (${endText}).`;
  } else if (p.checked && !p.fits) {
    tone = "bg-[#EC6668]/10 text-[#3A3A3A]";
    verdict = `Only ${p.available} deduction${p.available === 1 ? "" : "s"} fit before the school year ends (${endText}). Raise the monthly deduction to ₱${p.minMonthly.toLocaleString("en-PH", { minimumFractionDigits: 2 })} or more.`;
  } else if (p.tooLong) {
    tone = "bg-[#EC6668]/10 text-[#3A3A3A]";
    verdict = `The most allowed is ${MAX_DEDUCTIONS} deductions. Raise the monthly deduction to ₱${p.minForLimit.toLocaleString("en-PH", { minimumFractionDigits: 2 })} or more.`;
  } else if (p.checked) {
    tone = "bg-[#2AAF56]/10 text-[#3A3A3A]";
    verdict = `Within the school year (ends ${endText}).`;
  } else if (!SCHOOL_YEAR_TYPES.includes(form.loan_type)) {
    verdict =
      "SSS and Pag-IBIG loans follow the agency's schedule, so the school-year limit does not apply.";
  }

  return (
    <div
      className={`text-left text-xs rounded-[10px] px-3 py-2 leading-relaxed ${tone}`}
    >
      <div>
        <span className="font-semibold">
          {p.needed} deduction{p.needed === 1 ? "" : "s"}
        </span>
        . Expected last deduction:{" "}
        <span className="font-semibold">
          {cutoffLabel(p.last, p.lastIn)}
        </span>
        .
      </div>
      {verdict && <div>{verdict}</div>}
    </div>
  );
}

function NewLoanModal({ employees, schoolYearEnd, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.post(url + "/loans", form, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      notifySuccess("The loan was added.", "Loan created");
      onSaved();
      onClose();
    } catch (error) {
      notifyError(
        error.response?.data?.message ?? "Could not create the loan.",
        "Could not create the loan",
      );
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full border border-[#b2b2b2] rounded-[10px] p-2 bg-white";

  // earliest start date = today; latest = one year from today (YYYY-MM-DD, on this computer's
  // clock: toISOString() would use UTC and be a day behind in the Philippines in the morning)
  const today = new Date().toLocaleDateString("en-CA");
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const maxStartDate = nextYear.toLocaleDateString("en-CA");

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
          Deducted in
          <select
            value={form.cutoff}
            onChange={update("cutoff")}
            className={fieldClass}
          >
            <option value="first">1st – 15th of the month</option>
            <option value="second">16th – end of the month</option>
            <option value="both">Both cutoffs (half in each)</option>
          </select>
        </label>

        <label className="text-left text-sm font-medium">
          Total amount
          <input
            required
            type="number"
            min="0"
            max={
              ["Company", "Cash Advance"].includes(form.loan_type)
                ? 10000
                : undefined
            }
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
            max={form.total_amount}
            step="0.01"
            value={form.monthly_deduction}
            onChange={update("monthly_deduction")}
            className={fieldClass}
          />
        </label>

        <label className="text-left text-sm font-medium">
          Start date
          <DateInput
            required
            min={today}
            max={maxStartDate}
            value={form.start_date}
            onChange={update("start_date")}
            className={fieldClass}
          />
        </label>

        <LoanEndNote form={form} schoolYearEnd={schoolYearEnd} />

        <div className="flex flex-row gap-2 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 rounded-full text-white bg-[#EC6668] hover:bg-[#EC6668]/80 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1 rounded-full text-white bg-[#2AAF56] hover:bg-[#2AAF56]/80 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoansOutlet() {
  // the loans of the current page only; searching, counting and paging are done by the server
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ active: 0, paid: 0, outstanding: 0 }); // all loans, for the cards
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchSent, setSearchSent] = useState("");
  const [reload, setReload] = useState(0); // bump it to ask the server again
  const [rowsLoading, setRowsLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [schoolYearEnd, setSchoolYearEnd] = useState("");
  const [loading, setLoading] = useState(true); // the first load
  const [showNew, setShowNew] = useState(false);

  // wait for a pause in typing before asking the server, and start again at page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchSent(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const loadLoans = async () => {
      setRowsLoading(true);
      try {
        const params = { page, per_page: 10 };
        if (searchSent) params.search = searchSent;
        const response = await axios.get(url + "/loans", {
          params,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (cancelled) return; // a newer request has replaced this one
        const data = response.data;
        setRows(data.data);
        setStats(data.stats);
        setTotal(data.total);
        setLastPage(Math.max(1, data.last_page));
        // the page we asked for no longer exists (for example after a search): go to the last one
        if (data.data.length === 0 && data.total > 0 && page > data.last_page)
          setPage(data.last_page);
      } catch (error) {
        console.error("Failed to load loans:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRowsLoading(false);
        }
      }
    };
    loadLoans();
    return () => {
      cancelled = true;
    };
  }, [page, searchSent, reload]);

  useEffect(() => {
    axios
      .get(url + "/users", {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })
      .then((res) => setEmployees(res.data))
      .catch((error) => console.error("Failed to load employees:", error));
    // the school year end, to say whether a loan will be paid before it
    axios
      .get(url + "/systemSettings", {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })
      .then((res) => setSchoolYearEnd(res.data?.school_year_end ?? ""))
      .catch((error) => console.error("Failed to load school year:", error));
  }, []);

  const today = new Date().toLocaleDateString("en-CA");

  const activeCount = stats.active;
  const paidCount = stats.paid;
  const totalOutstanding = Number(stats.outstanding);

  const goToPage = (next) => {
    if (next < 1 || next > lastPage || next === page) return;
    setPage(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {loading && <Loading />}

      {/* Stat row */}
      <div className="flex w-full justify-between gap-4">
        <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-[#b2b2b2] rounded-[10px]">
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
        <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-[#b2b2b2] rounded-[10px]">
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
        <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-[#b2b2b2] rounded-[10px]">
          <div className="font-medium text-[#6675EC] text-left">Fully Paid</div>
          <div className="flex items-start justify-between">
            <span className="text-[24px] font-regular text-[#3A3A3A]">
              {paidCount}
            </span>
            <CircleOff className="text-[#EACA3A] w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Policy note */}
      <div className="flex items-start gap-2.5 px-4 py-3 bg-[#6675EC]/10 border border-[#b2b2b2] rounded-[10px]">
        <Info className="w-4 h-4 text-[#6675EC] shrink-0 mt-0.5" />
        <span className="text-xs text-[#8a90a3] text-left leading-relaxed">
          Loans are interest-free with a fixed monthly deduction. HR chooses when
          it is taken: in the 1st–15th cutoff, in the 16th–end cutoff (the
          default for a new loan), or half in each. An employee may hold only one active company
          loan at a time; SSS and Pag-IBIG loans can run alongside it. Company
          loans and cash advances are capped at ₱10,000. If net pay can't cover
          the deduction, the available amount is taken, and for SSS and Pag-IBIG
          loans the unpaid part is added to the next cutoff. When a balance
          reaches ₱0, the system marks the loan Paid and stops the deduction.
        </span>
      </div>

      {/* Loans table */}
      <Containers
        headerDefault={false}
        header={
          // the title on the left; the search box and the New loan button side by side on the right,
          // the same height, so they line up
          <div className="flex flex-row justify-between items-center gap-3">
            <div className="text-left">
              <h2 className="m-0">Loans &amp; Cash Advances</h2>
              <div className="text-xs text-[#8a90a3] mt-0.5">
                SSS, Pag-IBIG, company loans, and cash advances — all tracked
                the same way
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 shrink-0">
              <input
                type="search"
                name="search"
                id="search"
                placeholder="Search Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-[#8E8E8E] border-1 rounded-2xl w-100 px-3"
              />
              <button
                type="button"
                onClick={() => setShowNew(true)}
                className="flex items-center justify-center gap-1.5 h-9 bg-[#6675EC] hover:bg-[#5563d6] text-white text-sm font-semibold rounded-2xl px-4 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New loan
              </button>
            </div>
          </div>
        }
        currentPage={page}
        setCurrentPage={goToPage}
        totalPages={lastPage}
        total={total}
        arrowSize={32}
        spacing={false}
      >
        <div
          className={`w-full overflow-x-auto transition-opacity ${rowsLoading && !loading ? "opacity-50" : ""}`}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-[#8a90a3]">
                <th className="py-2 pl-5 pr-3 font-semibold">Employee</th>
                <th className="py-2 px-3 font-semibold">Type</th>
                <th className="py-2 px-3 font-semibold">Principal</th>
                <th className="py-2 px-3 font-semibold">Monthly deduction</th>
                <th className="py-2 px-3 font-semibold">Balance</th>
                <th className="py-2 px-3 font-semibold">Started</th>
                <th className="py-2 px-3 font-semibold">
                  Last deduction (est.)
                </th>
                <th className="py-2 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-6 text-center text-sm text-[#8a90a3]"
                  >
                    {searchSent
                      ? "No loan matches that name."
                      : "No loans yet."}
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
                        <Avatar user={loan.user} />
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
                      <div className="text-[11px] text-[#8a90a3]">
                        {loan.cutoff === "second"
                          ? "16th–end"
                          : loan.cutoff === "both"
                            ? "½ + ½ (both cutoffs)"
                            : "1st–15th"}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm font-semibold">
                      {peso(loan.remaining_balance)}
                    </td>
                    <td className="py-3 px-3 text-sm text-[#8a90a3]">
                      {loan.start_date}
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {(() => {
                        // a paid loan has no next deduction; a running one is counted from what is left
                        const p = predictRunningLoanEnd(
                          loan,
                          today,
                          schoolYearEnd,
                        );
                        if (!p)
                          return <span className="text-[#8a90a3]">—</span>;
                        return (
                          <>
                            {monthLabel(p.last)}
                            {p.checked && !p.fits ? (
                              <div className="text-[11px] text-[#EC6668]">
                                after the school year
                              </div>
                            ) : (
                              p.tooLong && (
                                <div className="text-[11px] text-[#EC6668]">
                                  over {MAX_DEDUCTIONS} deductions
                                </div>
                              )
                            )}
                          </>
                        );
                      })()}
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
      </Containers>

      {showNew && (
        <NewLoanModal
          employees={employees}
          schoolYearEnd={schoolYearEnd}
          onClose={() => setShowNew(false)}
          onSaved={() => {
            setPage(1); // the new loan is at the top
            setReload((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
