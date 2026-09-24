import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import { Link } from "react-router-dom";

export default function FlaggedSummary() {
  const [flagged, setFlagged] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchFlagged = async () => {
      try {
        const response = await axios.get(url + "/flaggedAttendance", {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setFlagged(response.data);
      } catch (error) {
        console.error("Failed to load flagged attendance:", error);
      }
    };
    fetchFlagged();
  }, []);

  if (flagged.length === 0) {
    return (
      <p className="text-sm text-[#8a90a3] text-center py-4">
        No flagged attendance.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {flagged.slice(0, 3).map((record) => (
        <div
          key={record.id}
          className="flex items-center justify-between border-b border-[#eef0f5] pb-2 last:border-b-0"
        >
          <div className="flex flex-col">
            <p className="m-0 font-semibold text-[#3A3A3A] text-[14px]">
              {record.user?.name}
            </p>
            <p className="m-0 text-[#8a90a3] text-[12px]">
              {record.location?.name}
            </p>
          </div>
          <p className="m-0 text-[13px] font-semibold text-[#EC6668]">
            {record.flagged_attendances_count}x
          </p>
        </div>
      ))}
      <Link
        to="/attendance/flagged"
        className="text-xs text-[#6675EC] hover:underline self-end mt-1"
      >
        View All
      </Link>
    </div>
  );
}
