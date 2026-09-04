//ICONS
// import { Users } from "lucide-react";

export default function countsLayout({ display, count, icon }) {
  return (
    <>
      <div class="flex-1 min-w-[150px] p-4 bg-white border border-gray-100 rounded-xl shadow-[0_0_6.3px_3px_rgba(0,0,0,0.25)]">
        <div className="flex items-start font-bold text-[#6675EC]">
          {display}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[24px] font-bold text-[#3A3A3A]">{count}</p>

          <div style={{ flexGrow: 1 }} />
          <span>{icon}</span>
        </div>
      </div>
    </>
  );
}
