import { useState, useEffect } from "react";
import LeaveRequestModal from "@/Modal/LeaveModal";
import { url } from "@/resources/api";
import Fallback from "@/assets/user.svg";
import AuthImage from "@/components/AuthImage";
export default function ItemContainer({ fetch }) {
  const [view, setView] = useState(false);
  const onView = () => {
    setView(true);
  };

  let statusColor;
  if (fetch.status == "Approved") {
    statusColor = "#2AAF56";
  } else if (fetch.status == "Pending") {
    statusColor = "#EACA3A";
  } else if (fetch.status == "Rejected") {
    statusColor = "#EC6668";
  }
  const startDate = new Date(fetch.start_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endDate = new Date(fetch.end_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const srvUrl = url.replace("/api", "/storage/");
  const fallbackImage = Fallback;
  const imageSrc = fetch.user?.image_path
    ? `${url}/${fetch.user?.image_path}`
    : null;
  return (
    <>
      <div className="flex gap-1 flex-col min-w-[360px] border-1 border-[#b8b8b8] py-2 rounded-[5px]">
        <div className="flex flex-row px-2 font-semibold justify-between">
          <p className="text-[16px]">ID - {fetch.user?.id}</p>
          <button
            onClick={onView}
            type="button"
            className="w-20 bg-[#2AAF56] hover:bg-[#EC6668] rounded-full text-white py-0.5"
          >
            View
          </button>
        </div>

        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5 mx-0 px-0" />

        <div className="px-2">
          <div className="m-0 leading-none flex gap-1 items-center justify-end font-semibold">
            <p className="text-[16px]">{fetch.status}</p>
            <div
              style={{ backgroundColor: statusColor }}
              className="w-4 h-4 rounded-full"
            />
          </div>
          <div className="flex flex-row gap-2 items-center">
            {/* image */}
            <div className="rounded-full w-15 h-15 border-1 overflow-hidden">
              <AuthImage
                src={imageSrc}
                fallback={fallbackImage}
                alt={`${fetch.user?.name || "User"}'s Profile`}
                className="object-cover scale-110"
              />
            </div>
            <div className="flex flex-col items-start">
              <p className="m-0 leading-none font-semibold text-[#3A3A3A] text-[16px]">
                {fetch.user?.name}
              </p>
              <p className="m-0 leading-none text-[#3A3A3A] text-[13px]">
                {fetch.user?.email}
              </p>
            </div>
          </div>
          <div className="m-0 leading-none flex gap-1 items-center justify-end font-medium">
            <p className="text-[#3A3A3A] text-[15px]">
              {fetch.user?.department} | {fetch.user?.position}
            </p>
          </div>
        </div>

        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5 mx-0 px-0" />
        <div className="flex flex-col py-1 px-2">
          <div className=" flex flex-row justify-between">
            <p className="text-[15px] font-medium">Leave Type:</p>
            <p className="text-[15px] font-regular">{fetch.leave_type}</p>
          </div>
          <div className=" leading-none flex flex-row justify-between">
            <p className="text-[15px] font-medium">Date Range:</p>
            <p className="text-[15px] font-regular">
              {startDate} - {endDate}
            </p>
          </div>
        </div>
      </div>
      {view && (
        <LeaveRequestModal leave={fetch} onClose={() => setView(false)} />
      )}
    </>
  );
}
