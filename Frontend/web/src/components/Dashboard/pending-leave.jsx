import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";

export default function PendingLeave() {
  const [pending, setPending] = useState([]);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true",
  };

  const fetchPending = async () => {
    try {
      const response = await axios.get(url + "/leave", { headers });
      setPending(
        response.data.filter((leave) => leave.status === "Pending"),
      );
    } catch (error) {
      console.error("Failed to load pending leave:", error);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleDecision = async (id, status) => {
    try {
      await axios.put(`${url}/leave/${id}`, { status }, { headers });
      fetchPending();
    } catch (error) {
      console.error("Failed to update leave application:", error);
    }
  };

  if (pending.length === 0) {
    return (
      <p className="text-sm text-[#8a90a3] text-center py-4">
        No pending leave requests.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {pending.slice(0, 5).map((leave) => (
        <div
          key={leave.id}
          className="flex items-center justify-between border-b border-[#eef0f5] pb-2 last:border-b-0"
        >
          <div className="flex flex-col">
            <p className="m-0 font-semibold text-[#3A3A3A] text-[14px]">
              {leave.user?.name}
            </p>
            <p className="m-0 text-[#8a90a3] text-[12px]">
              {leave.user?.contact_number} | {leave.leave_type}
            </p>
            <p className="m-0 text-[#3A3A3A] text-[12px] italic">
              {leave.reason}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => handleDecision(leave.id, "Approved")}
              className="text-xs px-2 py-1 rounded-full bg-[#2AAF56] text-white"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => handleDecision(leave.id, "Rejected")}
              className="text-xs px-2 py-1 rounded-full bg-[#EC6668] text-white"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
