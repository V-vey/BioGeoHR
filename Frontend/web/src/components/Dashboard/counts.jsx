//ICONS
// import { Users } from "lucide-react";

export default function countsLayout({ display, count, icon, percentage }) {
  return (
    <>
      <div className="flex-1 min-w-37.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
        <div className="flex items-start font-bold text-[#6675EC]">
          {display}
        </div>
        {/* <div className="h-0.5 w-full bg-[#E0E0E0] my-0.5" /> */}

        <div className="flex items-start justify-between">
          {/* We use flex-col here to stack the items tightly */}
          <div className="flex flex-col items-start leading-none">
            <span className="text-[24px] font-bold text-[#3A3A3A]">
              {count}
            </span>
            {percentage && (
              <span className="text-[13px] font-normal text-[#2AAF56] mt-0.5">
                {percentage}
              </span>
            )}
          </div>

          <span>{icon}</span>
        </div>
      </div>
    </>
  );
}
