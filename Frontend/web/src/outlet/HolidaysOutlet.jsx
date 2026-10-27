import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";
import { confirmDialog, notifyError } from "@/lib/dialog";
import DateInput from "@/components/DateInput";
import Containers from "@/components/container";

// The kind of holiday decides the pay (see SalaryService::workedDayExtra):
//   regular             200% if worked, paid even if not worked
//   special_non_working 130% if worked
//   special_working     an ordinary workday, nothing special in payroll
const TYPES = [
  {
    value: "regular",
    label: "Regular holiday",
    pay: "200% if worked",
    tag: "bg-[#EC6668]/15 text-[#B23A3C]",
  },
  {
    value: "special_non_working",
    label: "Special non-working day",
    pay: "130% if worked",
    tag: "bg-[#EACA3A]/25 text-[#7A5F00]",
  },
  {
    value: "special_working",
    label: "Special working day",
    pay: "ordinary workday",
    tag: "bg-[#2AAF56]/15 text-[#1B7A3B]",
  },
];
const typeOf = (value) => TYPES.find((t) => t.value === value) ?? TYPES[0];

const EMPTY = { date: "", name: "", type: "" };
const PER_PAGE = 10;

export default function HolidayOutlet() {
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null); // the holiday being edited, or null when adding
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const headers = () => ({
    "ngrok-skip-browser-warning": "true",
  });

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(url + "/holidays", { headers: headers() });
      setHolidays(res.data);
    } catch (error) {
      console.error("Failed to load holidays:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // the server says what is wrong (for example "There is already a holiday on that date.")
  const reason = (error, fallback) => {
    const errors = error.response?.data?.errors;
    return errors
      ? Object.values(errors)[0][0]
      : error.response?.data?.message || fallback;
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${url}/holidays/${editingId}`, form, {
          headers: headers(),
        });
      } else {
        await axios.post(url + "/holidays", form, { headers: headers() });
      }
      resetForm();
      await fetchHolidays();
    } catch (error) {
      notifyError(
        reason(error, "Could not save the holiday."),
        editingId ? "Could not save holiday" : "Could not add holiday",
      );
      setLoading(false);
    }
  };

  const handleEdit = (h) => {
    setEditingId(h.id);
    setForm({
      date: String(h.date).slice(0, 10),
      name: h.name,
      type: h.type ?? "regular",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog("This cannot be undone.", {
      title: "Delete this holiday?",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    setLoading(true);
    try {
      await axios.delete(`${url}/holidays/${id}`, { headers: headers() });
      if (editingId === id) resetForm();
      await fetchHolidays();
    } catch (error) {
      console.error("Delete failed:", error);
      setLoading(false);
    }
  };

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const fieldClass = "w-full border border-[#b2b2b2] rounded-[10px] p-2";
  const selected = TYPES.find((t) => t.value === form.type);

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const filtered = holidays.filter((h) =>
    h.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // a delete can empty the last page: show the page before it instead
  const page = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {loading && <Loading />}
      <div className="flex flex-col gap-4">
        <div className=" flex justify-end p-4 md:p-[16px_20px]  bg-white border border-[#b2b2b2] rounded-[14px]">
          <h2 className="text-[#6675EC] font-bold justify-end">Holidays</h2>
        </div>
        <div className="bg-white border border-[#b2b2b2] rounded-[10px] w-full">
          <div className="text-start px-4 py-2">
            <p className="font-medium">
              {editingId ? "Edit holiday" : "Add a holiday"}
            </p>
          </div>
          <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5" />

          <form
            onSubmit={handleSubmit}
            className="flex flex-row flex-wrap gap-4 px-4 py-4"
          >
            <div className="flex flex-col flex-1 items-start min-w-[170px]">
              <p className="font-medium pl-2">Date</p>
              <DateInput
                required
                value={form.date}
                onChange={update("date")}
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col flex-3 items-start min-w-[220px]">
              <p className="font-medium pl-2">Name</p>
              <input
                required
                type="text"
                value={form.name}
                onChange={update("name")}
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col flex-2 items-start min-w-[220px]">
              <p className="font-medium pl-2">Type</p>
              <div className="relative w-full">
                <select
                  required
                  value={form.type}
                  onChange={update("type")}
                  className={`${fieldClass} appearance-none pr-8 bg-white`}
                >
                  <option value="">Select type</option>
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-row gap-2 mt-6">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#2AAF56] hover:bg-[#2AAF56]/80 text-white font-medium"
              >
                {editingId ? "Save changes" : "Create"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 rounded-full border border-[#b2b2b2] hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          {/* <p className="px-4 pb-4 text-sm text-[#8a90a3] text-left">
            {selected
              ? `${selected.label}: ${selected.pay}.`
              : "The type sets the pay: a regular holiday pays 200% if worked, a special non-working day 130%, and a special working day is an ordinary workday."}{" "}
            Follow the yearly proclamation.
          </p> */}
        </div>

        <Containers
          name="Holiday List"
          currentPage={page}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          total={filtered.length}
          perPage={PER_PAGE}
          emptyText={
            search.trim() ? "No holidays match that name." : "No holidays yet."
          }
          loading={loading}
          search={search}
          setSearch={handleSearch}
          arrowSize={32}
          spacing={false}
        >
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#b2b2b2] text-sm text-[#8a90a3]">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((h) => {
                  const t = typeOf(h.type);
                  return (
                    <tr
                      key={h.id}
                      className={`border-t border-[#b2b2b2] first:border-t-0 ${
                        editingId === h.id ? "bg-[#6675EC]/5" : ""
                      }`}
                    >
                      <td className="px-4 py-2">
                        {format(
                          new Date(String(h.date).slice(0, 10) + "T00:00:00"),
                          "MMM d, yyyy",
                        )}
                      </td>
                      <td className="px-4 py-2">{h.name}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${t.tag}`}
                        >
                          {t.label}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex flex-row gap-3 justify-end">
                          <button
                            type="button"
                            onClick={() => handleEdit(h)}
                            className="text-[#6675EC] hover:text-[#6675EC]/80"
                            aria-label="Edit holiday"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(h.id)}
                            className="text-[#EC6668] hover:text-[#EC6668]/80"
                            aria-label="Delete holiday"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Containers>
      </div>
    </>
  );
}
