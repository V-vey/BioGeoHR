import { useState } from "react";
import { Plus, Pencil, CalendarClock, Landmark, ShieldCheck } from "lucide-react";
import StatusBadge from "@/components/Payroll/StatusBadge";

// Sample data for now — swap for an API call once the payroll endpoints exist.
const paySchedules = [
  {
    name: "Biweekly — Hourly Staff",
    frequency: "Biweekly",
    group: "52 employees",
    nextPayDate: "Feb 5, 2026",
  },
  {
    name: "Monthly — Salaried Staff",
    frequency: "Monthly",
    group: "32 employees",
    nextPayDate: "Jan 31, 2026",
  },
  {
    name: "Contractor Payments",
    frequency: "Monthly",
    group: "8 contractors",
    nextPayDate: "Jan 31, 2026",
  },
];

const deductions = [
  { name: "401(k) Retirement", note: "6% default employer match", type: "Pre-tax", enabled: true },
  { name: "Health Insurance — Medical", note: "", type: "Pre-tax", enabled: true },
  { name: "Health Insurance — Dental", note: "", type: "Pre-tax", enabled: true },
  { name: "Health Insurance — Vision", note: "", type: "Pre-tax", enabled: true },
  { name: "FSA — Flexible Spending", note: "", type: "Pre-tax", enabled: false },
  { name: "Wellness Stipend", note: "", type: "Post-tax", enabled: true },
];

const stateAccounts = [
  { state: "California", id: "CA-SIT-00291" },
  { state: "Oregon", id: "OR-SIT-00114" },
];

const tabs = [
  { key: "schedules", label: "Pay Schedules", icon: CalendarClock },
  { key: "deductions", label: "Deductions & Benefits", icon: Landmark },
  { key: "tax", label: "Tax Configuration", icon: ShieldCheck },
];

export default function PayrollSettingsOutlet() {
  const [active, setActive] = useState("schedules");

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {/* Mini nav */}
      <div className="w-full md:w-60 shrink-0 bg-white border border-[#eef0f5] rounded-[14px] p-2 flex md:flex-col gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[8px] text-sm font-medium whitespace-nowrap text-left transition-colors ${
                isActive
                  ? "bg-[#6675EC]/10 text-[#6675EC]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 w-full bg-white border border-[#eef0f5] rounded-[14px] overflow-hidden">
        {active === "schedules" && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f5]">
              <div className="text-left">
                <h2 className="m-0 text-base font-bold text-[#3A3A3A]">
                  Pay Schedules
                </h2>
                <div className="text-xs text-[#8a90a3] mt-0.5">
                  Define how often each employee group gets paid
                </div>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 bg-[#6675EC] hover:bg-[#5563d6] text-white text-sm font-semibold rounded-[8px] px-3.5 py-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add schedule
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-[#8a90a3]">
                    <th className="py-2 pl-5 pr-3 font-semibold">Schedule name</th>
                    <th className="py-2 px-3 font-semibold">Frequency</th>
                    <th className="py-2 px-3 font-semibold">Employee group</th>
                    <th className="py-2 px-3 font-semibold">Next pay date</th>
                    <th className="py-2 px-3 font-semibold">Status</th>
                    <th className="py-2 pr-5 pl-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {paySchedules.map((s) => (
                    <tr key={s.name} className="border-t border-[#eef0f5] hover:bg-gray-50">
                      <td className="py-3 pl-5 pr-3 text-sm font-semibold text-[#3A3A3A]">
                        {s.name}
                      </td>
                      <td className="py-3 px-3 text-sm text-[#8a90a3]">
                        {s.frequency}
                      </td>
                      <td className="py-3 px-3 text-sm text-[#8a90a3]">
                        {s.group}
                      </td>
                      <td className="py-3 px-3 text-sm">{s.nextPayDate}</td>
                      <td className="py-3 px-3">
                        <StatusBadge tone="success">Active</StatusBadge>
                      </td>
                      <td className="py-3 pr-5 pl-3">
                        <button
                          type="button"
                          className="text-[#8a90a3] hover:text-[#6675EC]"
                          aria-label={`Edit ${s.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === "deductions" && (
          <>
            <div className="px-5 py-4 border-b border-[#eef0f5] text-left">
              <h2 className="m-0 text-base font-bold text-[#3A3A3A]">
                Deductions &amp; Benefits
              </h2>
              <div className="text-xs text-[#8a90a3] mt-0.5">
                Manage the deduction types available during payroll runs
              </div>
            </div>
            <div className="divide-y divide-[#eef0f5]">
              {deductions.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="text-left">
                    <div className="text-sm font-semibold text-[#3A3A3A]">
                      {d.name}
                    </div>
                    {d.note && (
                      <div className="text-xs text-[#8a90a3] mt-0.5">
                        {d.note}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge tone="neutral">{d.type}</StatusBadge>
                    <StatusBadge tone={d.enabled ? "success" : "neutral"}>
                      {d.enabled ? "Enabled" : "Disabled"}
                    </StatusBadge>
                    <button
                      type="button"
                      className="text-[#8a90a3] hover:text-[#6675EC]"
                      aria-label={`Edit ${d.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {active === "tax" && (
          <div className="px-5 py-5 text-left">
            <h2 className="m-0 text-base font-bold text-[#3A3A3A]">
              Tax Configuration
            </h2>
            <div className="text-xs text-[#8a90a3] mt-0.5 mb-5">
              Federal and state tax accounts used to calculate withholding
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pb-5 border-b border-[#eef0f5]">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                  Federal EIN
                </div>
                <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                  84-XXXXXXX
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                  Federal filing frequency
                </div>
                <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                  Semi-weekly
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                  FUTA rate
                </div>
                <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                  0.6%
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[#8a90a3] font-semibold">
                  SUTA rate (CA)
                </div>
                <div className="text-sm font-semibold text-[#3A3A3A] mt-1">
                  3.4%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 mb-3">
              <div className="text-sm font-bold text-[#3A3A3A]">
                State tax accounts
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-semibold text-[#6675EC] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add state
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {stateAccounts.map((s) => (
                <div
                  key={s.state}
                  className="flex items-center justify-between px-4 py-3 border border-[#eef0f5] rounded-[8px]"
                >
                  <span className="text-sm font-semibold text-[#3A3A3A]">
                    {s.state}
                  </span>
                  <span className="text-sm text-[#8a90a3]">{s.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
