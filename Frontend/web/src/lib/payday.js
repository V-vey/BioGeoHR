// The school's paydays (follow-up questionnaire, Q1): the 1st-15th period is paid on the 20th of the same month,
// the 16th-end period on the 5th of the next month. "2026-11-01" -> "2026-11-20", "2026-11-16" -> "2026-12-05",
// "2026-12-16" -> "2027-01-05".
export const paydayFor = (periodStart) => {
  const [y, m, d] = String(periodStart).slice(0, 10).split("-").map(Number);
  const pad = (n) => String(n).padStart(2, "0");

  if (d <= 15) return `${y}-${pad(m)}-20`;
  return m === 12 ? `${y + 1}-01-05` : `${y}-${pad(m + 1)}-05`;
};
