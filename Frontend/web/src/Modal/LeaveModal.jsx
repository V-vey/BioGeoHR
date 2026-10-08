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
  const [remarks, setRemarks] = useState(leave.remarks ?? "");
  let handleDecision;
  let buttonRes = true;
  if (leave.status == "Approved" || leave.status == "Rejected") {
    buttonRes = false;
  }
  if (buttonRes) {
    handleDecision = async (id, status) => {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `${url}/leave/${id}`,
          { status, remarks },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        // only the Dashboard passes a reload function; the other pages pass nothing
        if (typeof fetch === "function") {
          fetch();
        }
        onClose();
        alert(`The leave request has been ${status.toLowerCase()}.`);
      } catch (error) {
        console.error("Failed to update leave application:", error);
        // show why, for example "Insufficient leave balance"
        setErrorMsg(error.response?.data?.message || "Something went wrong.");
      }
    };
  }

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
      <div className="flex flex-col gap-2 bg-[#f2f2f2] rounded-xl p-6 min-w-[70%] max-w-[60%] min-h-[80%]  ">
        <div className="flex flex-row justify-between bg-white items-center px-4 py-3 rounded-[10px] border border-[#b2b2b2]">
          <button
            onClick={onClose}
            className="text-white bg-[#2AAF56] text-[20px] items-center rounded-[10px]  px-4 py-1 hover:bg-[#6675EC]"
          >
            ← Back
          </button>
          <h2 className="font-bold">Leave Request</h2>
        </div>

        <div className="flex flex-row gap-2">
          <div className="flex flex-col flex-3 gap-2">
            <div className="flex flex-row justify-between w-full bg-white border border-[#b2b2b2] px-4 py-3 rounded-[10px]">
              <div className="flex flex-col items-start">
                <p className="m-0 leading-none text-[16px] font-medium">
                  {leave.user?.name}
                </p>
                <p className="m-0 leading-none text-[13px] font-regular">
                  {leave.user?.department} | {leave.user?.position}
                </p>
              </div>
              <div>
                <p className="font-medium">{leave.leave_type}</p>
              </div>
            </div>
            <div className="w-full bg-white border border-[#b2b2b2] min-h-[530px] rounded-[10px] py-2 flex flex-col gap-2">
              <div className="flex flex-row justify-between px-4">
                <p className="text-[#b2b2b2] text-[24px] font-bold">Reason</p>
                <p className="text-[#b2b2b2] text-[17px] font-regular">
                  {startDate} - {endDate}
                </p>
              </div>
              <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5 " />
              <p className="text-justify font-regular px-4 text-[16px]">
                {leave.reason}
              </p>
            </div>
          </div>
          {/* Balance */}
          <div className="flex flex-col flex-1 w-full  gap-2">
            <div className="flex-1items-center bg-white w-full px-4 py-3.5 border border-[#b2b2b2] rounded-[10px] ">
              <p className="text-[#b2b2b2] text-[20px] font-bold text-start">
                Leave Balance:
              </p>
            </div>
            {Balance("Sick Leave: ", leave.user?.leave_balance?.sick)}
            {Balance("Vacation Leave: ", leave.user?.leave_balance?.vacation)}
            {Balance("Emergency Leave: ", leave.user?.leave_balance?.emergency)}
            {Balance("Birthday Leave: ", leave.user?.leave_balance?.birthday)}
            {Balance(
              "Solo Parent Leave: ",
              leave.user?.leave_balance?.solo_parent,
            )}
            {Balance("Paternity Leave: ", leave.user?.leave_balance?.paternity)}
            {Balance("Maternity Leave: ", leave.user?.leave_balance?.maternity)}
          </div>
        </div>
        {/* editable while pending; read-only once HR has decided */}
        {(buttonRes || leave.remarks) && (
          <textarea
            className="w-full bg-white border border-[#b2b2b2] rounded-[10px] min-h-15 px-4 py-2 text-center [&::placeholder]:text-center"
            placeholder="Enter Remark (optional)"
            maxLength={500}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            readOnly={!buttonRes}
          />
        )}
        {buttonRes && (
          <div className="flex flex-row justify-end gap-2 text-[19px] text-white font-bold">
            <button
              onClick={() => handleDecision(leave.id, "Rejected")}
              className="bg-[#EC6668] px-3 py-1 rounded-[10px] hover:bg-[#6675EC]"
            >
              Reject
            </button>
            <button
              onClick={() => handleDecision(leave.id, "Approved")}
              className="bg-[#2AAF56] px-3 py-1 rounded-[10px] hover:bg-[#6675EC]"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-[#EC6668] text-sm text-right">{errorMsg}</p>
      )}
    </div>
  );
}
