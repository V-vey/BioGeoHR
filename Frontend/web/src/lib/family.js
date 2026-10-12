// Helpers for an employee's spouse and children (a name and a birthday each).
// The family is only shown on the profile; no pay or tax calculation uses it.

// the server's list -> rows the form can edit
export const familyFromServer = (list) =>
  (list ?? []).map((m) => ({
    relationship: m.relationship,
    name: m.name ?? "",
    birthday: m.birthday ? String(m.birthday).slice(0, 10) : "",
  }));

// the form's rows -> what is sent: a row with nothing typed in it is dropped
export const cleanFamily = (rows) =>
  (rows ?? [])
    .filter((r) => r.name.trim() || r.birthday)
    .map((r) => ({
      relationship: r.relationship,
      name: r.name.trim(),
      birthday: r.birthday || null,
    }));

// "1990-03-04" -> "Mar 4, 1990"
export const formatBirthday = (date) =>
  date
    ? new Date(String(date).slice(0, 10) + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";
