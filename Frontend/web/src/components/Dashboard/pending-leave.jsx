import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";

export default function PendingLeave({
  image,
  name,
  department,
  position,
  type,
}) {
  // if (pending.length === 0) {
  //   return (
  //     <p className="text-sm text-[#8a90a3] text-center py-4">
  //       No pending leave requests.
  //     </p>
  //   );
  // }

  return (
    <>
      <div className="flex flex-row w-full px-4 items-center">
        <div className="flex-2 flex flex-row gap-2 items-center">
          <div className="rounded-full w-10 h-10 border-1" />
          <div className="flex flex-col items-start">
            <p className="m-0 leading-none text-[16px] font-medium">{name}</p>
            <p className="m-0 leading-none text-[13px] font-regular">
              {department} | {position}
            </p>
          </div>
        </div>
        <p className="flex-1 text-start m-0 text-[16px] font-medium">{type}</p>
        <div className="flex-1 flex justify-end">
          <button className="text-s text-[#f2f2f2] bg-[#6675EC] px-4 hover:bg-[#2AAF56] rounded-[10px]">
            View
          </button>
        </div>
      </div>
    </>
  );
}
