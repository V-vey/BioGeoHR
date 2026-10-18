// When will a loan be fully paid? The same rule as the backend (LoanController::pastSchoolYear):
// one deduction a month, taken in the first cutoff (the 1st to the 15th). The first deduction is the
// first such cutoff that ends on or after the start date, and the school's own loans (Company and
// Cash Advance) must be finished before the school year ends. SSS and Pag-IBIG follow the agency.

export const SCHOOL_YEAR_TYPES = ["Company", "Cash Advance"];

// No loan, of any type, may take more monthly deductions than this (the backend enforces it too:
// LoanController::MAX_DEDUCTIONS).
export const MAX_DEDUCTIONS = 36;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2026-10-20" (or a full ISO date) -> { y, m, d }, with m = 0..11. No time-zone surprises.
const parts = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return { y, m: m - 1, d };
};

// a month as one number, so adding months is just adding
const monthIndex = ({ y, m }) => y * 12 + m;

// the month of the first deduction for a plan that starts on this date
const firstDeductionMonth = (startDate) => {
  const p = parts(startDate);
  return monthIndex(p) + (p.d <= 15 ? 0 : 1);
};

export const cutoffLabel = (index) =>
  `${MONTHS[index % 12]} 1–15, ${Math.floor(index / 12)}`;

export const monthLabel = (index) =>
  `${MONTHS[index % 12]} ${Math.floor(index / 12)}`;

export const dateLabel = (iso) => {
  const p = parts(iso);
  return `${MONTHS[p.m]} ${p.d}, ${p.y}`;
};

// how many deductions an amount needs at this monthly figure
const deductionsNeeded = (amount, monthly) =>
  Math.ceil(Math.round((amount / monthly) * 1e6) / 1e6);

/**
 * The expected last deduction.
 *   amount        what is still to be paid (the total for a new loan, the balance for a running one)
 *   monthly       the monthly deduction
 *   startDate     YYYY-MM-DD, the day the plan starts
 *   type          the loan type
 *   schoolYearEnd YYYY-MM-DD, or empty when no school year is set
 * Returns null while the numbers are incomplete.
 */
export function predictLoanEnd({
  amount,
  monthly,
  startDate,
  type,
  schoolYearEnd,
}) {
  const total = Number(amount);
  const perMonth = Number(monthly);
  if (!(total > 0) || !(perMonth > 0) || !startDate) return null;

  const first = firstDeductionMonth(startDate);
  const needed = deductionsNeeded(total, perMonth);
  const last = first + needed - 1;

  const result = {
    needed,
    last,
    checked: false, // is the school-year rule applied to this loan?
    fits: true,
    available: null,
    minMonthly: null,
    tooLong: needed > MAX_DEDUCTIONS,
    minForLimit: Math.ceil((total / MAX_DEDUCTIONS) * 100) / 100, // the smallest monthly amount within the limit
  };

  if (schoolYearEnd && SCHOOL_YEAR_TYPES.includes(type)) {
    const endMonth = monthIndex(parts(schoolYearEnd));
    result.checked = true;
    result.available = first > endMonth ? 0 : endMonth - first + 1;
    result.fits = needed <= result.available;
    if (!result.fits && result.available > 0) {
      result.minMonthly = Math.ceil((total / result.available) * 100) / 100;
    }
  }
  return result;
}

// A running loan: what is left, counted from today (or its start date, if that is later).
export function predictRunningLoanEnd(loan, today, schoolYearEnd) {
  if (loan.status !== "Active") return null;
  const start = String(loan.start_date).slice(0, 10);
  return predictLoanEnd({
    amount: loan.remaining_balance,
    monthly: loan.monthly_deduction,
    startDate: start > today ? start : today,
    type: loan.loan_type,
    schoolYearEnd,
  });
}
