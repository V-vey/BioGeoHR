import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Pagination from "../components/Pagination.jsx";
import { useFilterPanel } from "../hooks/useFilterPanel.js";

// Maps an employee's availability status to Tailwind utility classes
const STATUS_META = {
  Available: { textCls: "text-green-500", dotBg: "bg-green-500" },
  Unavailable: { textCls: "text-red-500", dotBg: "bg-red-500" },
  Break: { textCls: "text-yellow-500", dotBg: "bg-yellow-500" },
  Leave: { textCls: "text-blue-500", dotBg: "bg-blue-500" },
};

export default function AllEmployees() {
  // Expected shape per entry:
  //   { id, name, email, dept, role, contract, join, status }
  const [employees, setEmployees] = useState([]);
  const { open, setOpen, panelRef, buttonRef } = useFilterPanel();

  useEffect(() => {
    // Data fetching goes here once the backend is connected.
  }, []);

  return (
    <>
      <Sidebar />

      <main className="flex-1 p-[16px] md:p-[22px_28px]">
        {/* Topbar */}
        <div className="flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
          <h2 className="m-0 text-lg text-[#6c63ff] font-bold">Employees</h2>
        </div>

        {/* Card Container */}
        <div className="mb-4 p-4 bg-white border border-[#eef0f5] rounded-[14px]">
          <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-[14px]">
            <h2 className="m-0 text-base text-[#6c63ff] font-bold">
              All of Employees
            </h2>

            {/* Search bar and filter dropdown trigger */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <input
                className="w-full md:w-[220px] p-[7px_12px] border border-[#eef0f5] rounded-[8px] bg-[#fafbfd] text-xs focus:outline-none focus:border-[#6c63ff]"
                type="text"
                placeholder="Search name or ID"
              />
              <button
                ref={buttonRef}
                onClick={() => setOpen((o) => !o)}
                className="w-8 h-8 border border-[#eef0f5] rounded-[8px] bg-white text-[#8a90a3] text-sm cursor-pointer hover:bg-gray-50"
              >
                ▾
              </button>

              {/* Filter dropdown panel */}
              <div
                ref={panelRef}
                className={`absolute top-[42px] right-0 z-10 w-full max-w-[260px] p-4 bg-white border border-[#eef0f5] rounded-[12px] shadow-[0_10px_30px_rgba(20,20,40,0.12)] ${open ? "block" : "hidden"}`}
              >
                <h4 className="m-0 mb-2 text-xs text-[#1f2430] font-bold">
                  Availability
                </h4>
                <div className="flex flex-col gap-2.5 mb-[14px] text-xs text-[#8a90a3]">
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-[#6c63ff]"
                    />{" "}
                    Available
                  </label>
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                    Unavailable
                  </label>
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" /> Break
                  </label>
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" /> Leave
                  </label>
                </div>

                <h4>Contract Type</h4>
                <div className="flex flex-col gap-2.5 mb-[14px] text-xs text-[#8a90a3]">
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-[#6c63ff]"
                    />{" "}
                    Full-time
                  </label>
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                    Freelance
                  </label>
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                    Internship
                  </label>
                </div>

                <h4>Department</h4>
                <div className="flex flex-col gap-2.5 mb-[14px] text-xs text-[#8a90a3]">
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                    Product
                  </label>
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                    Engineer
                  </label>
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                    Marketing
                  </label>
                  <label className="flex items-center gap-[5px] cursor-pointer">
                    <input type="checkbox" className="accent-[#6c63ff]" />{" "}
                    Finance
                  </label>
                </div>

                <h4>Joined Date</h4>
                <div className="flex items-center gap-2 mb-[14px]">
                  <select className="flex-1 p-[6px] border border-[#eef0f5] rounded-[6px] text-[11px] focus:outline-none">
                    <option>April 1, 2026</option>
                  </select>
                  <span className="text-gray-400">-</span>
                  <select className="flex-1 p-[6px] border border-[#eef0f5] rounded-[6px] text-[11px] focus:outline-none">
                    <option>April 5, 2026</option>
                  </select>
                </div>

                <button className="w-full p-2.5 border-none rounded-[8px] bg-[#6c63ff] text-white text-xs font-semibold cursor-pointer hover:bg-opacity-90">
                  Confirm
                </button>
              </div>
            </div>
          </div>

          {/* Employee cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {employees.map((employee) => {
              const meta = STATUS_META[employee.status] || {
                textCls: "text-gray-500",
                dotBg: "bg-gray-400",
              };
              return (
                <article
                  className="p-3.5 bg-white border border-[#eef0f5] rounded-[12px]"
                  key={employee.id}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="text-[11px] text-[#8a90a3]">
                      ID - {employee.id}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Link
                        className="inline-block p-[5px_14px] border-none rounded-[12px] bg-[#22c55e] text-white text-[11px] font-semibold no-underline cursor-pointer hover:bg-opacity-90"
                        to={`/employees/${employee.id}`}
                      >
                        View
                      </Link>
                      <div
                        className={`flex items-center gap-1 mt-1 text-[11px] text-right font-medium ${meta.textCls}`}
                      >
                        {employee.status}
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${meta.dotBg}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-200" />
                    <div>
                      <div className="text-sm font-bold text-[#1f2430]">
                        {employee.name}
                      </div>
                      <div className="text-[11px] text-[#8a90a3]">
                        {employee.email}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#8a90a3]">
                        {employee.dept} | {employee.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2.5 border-t border-[#eef0f5] text-[11px] text-[#8a90a3]">
                    <div className="leading-relaxed">
                      Contract Type:
                      <b className="block text-[#1f2430] font-semibold">
                        {employee.contract}
                      </b>
                    </div>
                    <div className="leading-relaxed text-right">
                      Join Date:
                      <b className="block text-[#1f2430] font-semibold">
                        {employee.join}
                      </b>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="flex justify-between items-center mt-4 text-xs text-[#8a90a3]">
            <span>Page 1</span>
            <Pagination />
          </div>
        </div>
      </main>
    </>
  );
}
