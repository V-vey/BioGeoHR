import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";
import Containers from "@/components/container.jsx";

const CATEGORIES = {
  login: "Login",
  check_in: "Check-in",
  admin: "HR actions",
};

const emptyFilters = { category: "", status: "", from: "", to: "" };

const fieldClass = "w-full border border-[#b2b2b2] rounded-[10px] p-2 bg-white";

export default function AuditLogOutlet() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // what the inputs show vs. what the table is actually filtered by
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);

  useEffect(() => {
    let cancelled = false;

    const fetchLogs = async () => {
      try {
        const params = { page };
        Object.entries(applied).forEach(([key, value]) => {
          if (value) params[key] = value;
        });
        const res = await axios.get(url + "/audit-logs", {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        if (cancelled) return;
        setLogs(res.data.data);
        setLastPage(res.data.last_page);
        setTotal(res.data.total);
      } catch (error) {
        console.error("Failed to load audit log:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [page, applied]);

  const update = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const handleApply = (e) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setApplied(filters);
  };

  const handleReset = () => {
    setLoading(true);
    setPage(1);
    setFilters(emptyFilters);
    setApplied(emptyFilters);
  };

  // the container calls this with the next / previous page number
  const goToPage = (next) => {
    if (next < 1 || next > lastPage || next === page) return;
    setLoading(true);
    setPage(next);
  };

  const filterForm = (
    <form
      onSubmit={handleApply}
      className="flex flex-row flex-wrap gap-4 pt-3 items-end"
    >
      <div className="flex flex-row flex-wrap gap-4 pt-3 items-end w-full">
        <label className="flex flex-col flex-1 min-w-[130px] items-start text-sm font-medium">
          Category
          <select
            value={filters.category}
            onChange={update("category")}
            className={fieldClass}
          >
            <option value="">All</option>
            {Object.entries(CATEGORIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col flex-1 min-w-[110px] items-start text-sm font-medium">
          Status
          <select
            value={filters.status}
            onChange={update("status")}
            className={fieldClass}
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label className="flex flex-col flex-1 min-w-[140px] items-start text-sm font-medium">
          From
          <input
            type="date"
            value={filters.from}
            onChange={update("from")}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col flex-1 min-w-[140px] items-start text-sm font-medium">
          To
          <input
            type="date"
            value={filters.to}
            onChange={update("to")}
            className={fieldClass}
          />
        </label>
      </div>
      <div className="flex flex-row gap-2 justify-end items-center w-full">
        <button
          type="submit"
          className="px-6 py-2 rounded-full bg-[#2AAF56] hover:bg-[#6675EC] text-white font-medium"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-full border border-[#b2b2b2]"
        >
          Reset
        </button>
      </div>
    </form>
  );

  return (
    <>
      {loading && <Loading />}
      <div className="flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold">Audit Log</h2>
      </div>

      <Containers
        name="Audit Log"
        searchShow={false}
        header={filterForm}
        currentPage={page}
        setCurrentPage={goToPage}
        totalPages={lastPage}
        arrowSize={32}
        spacing={false}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#b2b2b2] text-sm text-[#8a90a3]">
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-[#8a90a3]"
                  >
                    No entries match these filters.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-[#b2b2b2] first:border-t-0 text-sm"
                >
                  <td className="px-4 py-2 whitespace-nowrap text-[#8a90a3]">
                    {format(new Date(log.created_at), "MMM d, h:mm a")}
                  </td>
                  <td className="px-4 py-2">
                    {log.user?.name ?? log.email ?? "Unknown"}
                  </td>
                  <td className="px-4 py-2">
                    {CATEGORIES[log.category] ?? log.category}
                  </td>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-[6px] text-xs ${
                        log.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {log.status === "failed" ? "Failed" : "Success"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[#8a90a3]">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Containers>
    </>
  );
}
