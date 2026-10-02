import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";
import LeaveRequestModal from "@/Modal/LeaveModal";
import Fallback from "@/assets/user.svg";
export default function PendingLeave({ item, fetch }) {
  // if (pending.length === 0) {
  //   return (
  //     <p className="text-sm text-[#8a90a3] text-center py-4">
  //       No pending leave requests.
  //     </p>
  //   );
  // }
  const [view, setView] = useState(false);
  const onView = () => {
    setView(true);
  };
  const srvUrl = url.replace("/api", "/storage/");
  const fallbackImage = Fallback;
  const imageSrc = item.user?.image_path
    ? `${srvUrl}${item.user?.image_path}`
    : fallbackImage;
  return (
    <>
      <div className="flex flex-row w-full px-4 items-center">
        <div className="flex-2 flex flex-row gap-2 items-center">
          <div className="border rounded-[10px] w-12 h-12 overflow-hidden">
            <img
              src={imageSrc}
              alt={`${item.user?.name || "User"}'s Profile`}
              className="object-cover scale-110"
            />
          </div>

          <div className="flex flex-col items-start">
            <p className="m-0 leading-none text-[16px] font-medium">
              {item.user?.name}
            </p>
            <p className="m-0 leading-none text-[13px] font-regular">
              {item.user?.department} | {item.user?.position}
            </p>
          </div>
        </div>
        <p className="flex-1 text-start m-0 text-[16px] font-medium">
          {item.leave_type}
        </p>
        <div className="flex-1 flex justify-end">
          <button
            onClick={onView}
            className="text-s text-[#f2f2f2] bg-[#2AAF56] px-4 hover:bg-[#6675EC] rounded-[10px]"
          >
            View
          </button>
        </div>
      </div>
      {view && (
        <LeaveRequestModal
          fetch={fetch}
          leave={item}
          onClose={() => setView(false)}
        />
      )}
    </>
  );
}
