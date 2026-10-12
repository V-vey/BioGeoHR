import { Plus, Trash2 } from "lucide-react";
import { formatBirthday } from "@/lib/family";

// An employee's spouse and children: a name and a birthday each. It is only shown on the
// profile; no pay or tax calculation uses it.

const inputClass =
  "w-full h-10 px-3 border border-[#b2b2b2] rounded-xl text-sm outline-none focus:border-[#6675EC] focus:ring-2 focus:ring-[#6675EC]/20 transition-colors bg-white";

// The editable table used in the create form and in Edit Profile.
export default function FamilyTable({ value, onChange }) {
  const rows = value ?? [];
  const today = new Date().toLocaleDateString("en-CA"); // a birthday cannot be in the future
  const hasSpouse = rows.some((r) => r.relationship === "Spouse");

  const setRow = (index, patch) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const add = (relationship) =>
    onChange([...rows, { relationship, name: "", birthday: "" }]);
  const remove = (index) => onChange(rows.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-2 w-full text-left">
      {rows.length === 0 && (
        <p className="text-sm text-[#8a90a3]">
          No family members added. Add a spouse or a child below.
        </p>
      )}

      {rows.map((row, i) => (
        <div key={i} className="flex flex-row items-center gap-2">
          <span className="w-20 shrink-0 text-sm font-medium text-[#3A3A3A]">
            {row.relationship}
          </span>
          <input
            className={inputClass}
            placeholder="Full name"
            maxLength={100}
            value={row.name}
            onChange={(e) => setRow(i, { name: e.target.value })}
          />
          <input
            type="date"
            className={`${inputClass} max-w-[170px]`}
            max={today}
            value={row.birthday}
            onChange={(e) => setRow(i, { birthday: e.target.value })}
            aria-label={`${row.relationship} birthday`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label={`Remove ${row.relationship}`}
            className="shrink-0 text-[#EC6668] hover:opacity-70"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="flex flex-row gap-2 pt-1">
        <button
          type="button"
          onClick={() => add("Spouse")}
          disabled={hasSpouse}
          className="flex items-center gap-1 text-sm text-[#6675EC] font-medium hover:underline disabled:opacity-40 disabled:no-underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add spouse
        </button>
        <button
          type="button"
          onClick={() => add("Child")}
          className="flex items-center gap-1 text-sm text-[#6675EC] font-medium hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add child
        </button>
      </div>
    </div>
  );
}

// The read-only table shown on the profile.
export function FamilyView({ members }) {
  const list = members ?? [];
  if (list.length === 0) {
    return <p className="text-sm text-[#8a90a3] text-left">No family members added.</p>;
  }
  return (
    <div className="w-full text-left">
      <div className="flex flex-row px-2 py-1 border-b border-[#b2b2b2] text-[#8a90a3] font-medium">
        <p className="flex-1">Relationship</p>
        <p className="flex-2">Name</p>
        <p className="flex-1">Birthday</p>
      </div>
      {list.map((m, i) => (
        <div key={m.id ?? i} className="flex flex-row px-2 py-2 border-b border-[#eef0f5] last:border-b-0">
          <p className="flex-1">{m.relationship}</p>
          <p className="flex-2">{m.name}</p>
          <p className="flex-1">{formatBirthday(m.birthday)}</p>
        </div>
      ))}
    </div>
  );
}
