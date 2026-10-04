import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { url } from "@/resources/api";
import Loading from "@/components/Loading";

export default function HolidayOutlet() {
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState();
  const [loading, setLoading] = useState(true);

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(url + "/holidays", form, { headers: headers() });
      setForm({ date: "", name: "" });
      await fetchHolidays();
    } catch (error) {
      alert(error.response?.data?.message || "Could not add the holiday.");
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    setLoading(true);
    try {
      await axios.delete(`${url}/holidays/${id}`, { headers: headers() });
      await fetchHolidays();
    } catch (error) {
      console.error("Delete failed:", error);
      setLoading(false);
    }
  };

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <>
      {loading && <Loading />}
      <div className="flex flex-col gap-4">
        <div className=" flex justify-end p-4 md:p-[16px_20px]  bg-white border border-[#b2b2b2] rounded-[14px]">
          <h2 className="text-[#6675EC] font-bold justify-end">Holidays</h2>
        </div>
        <div className="bg-white border border-[#b2b2b2] rounded-[10px] w-full">
          <div className="text-start px-4 py-2">
            <p className="font-medium">Add a non-working day</p>
          </div>
          <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5" />

          <form
            onSubmit={handleSubmit}
            className="flex flex-row gap-4 px-4 py-4"
          >
            <div className="flex flex-col flex-1 items-start">
              <p className="font-medium pl-2">Date</p>
              <input
                type={"date"}
                onChange={update("date")}
                className="w-full border border-[#b2b2b2] rounded-[10px] p-2"
              />
            </div>
            <div className="flex flex-col flex-3 items-start">
              <p className="font-medium pl-2">Name</p>
              <input
                type={"text"}
                onChange={update("name")}
                className="w-full border border-[#b2b2b2] rounded-[10px] p-2"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 mt-6 rounded-full bg-[#2AAF56] hover:bg-[#6675EC] text-white font-medium"
            >
              Create
            </button>
          </form>
        </div>

        <div className="bg-white border border-[#b2b2b2] rounded-[10px] w-full overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#b2b2b2] text-sm text-[#8a90a3]">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-[#8a90a3]"
                  >
                    No holidays yet.
                  </td>
                </tr>
              )}
              {holidays.map((h) => (
                <tr
                  key={h.id}
                  className="border-t border-[#b2b2b2] first:border-t-0"
                >
                  <td className="px-4 py-2">
                    {format(
                      new Date(String(h.date).slice(0, 10) + "T00:00:00"),
                      "MMM d, yyyy",
                    )}
                  </td>
                  <td className="px-4 py-2">{h.name}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(h.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete holiday"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
