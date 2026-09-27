import axios from "axios";
import { url } from "@/resources/api";
import { useState, useEffect } from "react";

function Balance(type, item) {
  return (
    <div className="flex flex-1 flex-row justify-between items-center bg-white w-full px-4 py-3 border border-[#b2b2b2] rounded-[10px] font-medium ">
      <p>{type} </p>
      <p>{item}</p>
    </div>
  );
}

export default function LeaveRequestModal({ leave, onClose, fetch }) {
  const [errorMsg, setErrorMsg] = useState("");
  const handleDecision = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${url}/leave/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      fetch();
      onClose();
      alert("The Leave Have Been " + { status });
    } catch (error) {
      console.error("Failed to update leave application:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    }
  };
  const startDate = new Date(leave.start_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endDate = new Date(leave.end_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="flex flex-col gap-2 bg-[#f2f2f2] rounded-xl p-6 min-w-[70%] max-w-[60%] min-h-[80%] max-h-[80%] "></div>
    </div>
  );
}
