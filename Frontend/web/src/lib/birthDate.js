// The latest date of birth an employee may have: today minus 18 years (the server checks it too:
// UsersController::latestBirthDate). It comes from the local date: toISOString() is in UTC, which
// is a day off for a few hours around midnight in the Philippines.
export function latestBirthDate() {
  const today = new Date();
  const year = today.getFullYear() - 18;
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate(); // 29 Feb becomes 28 Feb, like the server
  const day = Math.min(today.getDate(), lastDay);

  const pad = (n) => String(n).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}
