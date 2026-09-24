import { useState } from "react";
import { format } from "date-fns";

export default function FlaggedItemContainer({
  name,
  department,
  position,
  location,
  date,
  flaggedAt,
  flagCount,
  excursions = [],
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex gap-1 flex-col min-w-[360px] border-1 border-[#b8b8b8] p-2 rounded-[5px]">
      <div className="flex justify-between">
        <p className="text-[16px] font-semibold text-[#3A3A3A]">{date}</p>
        <p className="text-[16px] font-semibold">{location}</p>
      </div>
      <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />
      <div className="my-1">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start">
            <p className="m-0 leading-none font-semibold text-[#3A3A3A] text-[16px]">
              {name}
            </p>
            <p className="m-0 leading-none text-[#3A3A3A] text-[13px]">
              {department} | {position}
            </p>
          </div>
          <div className="flex gap-1 items-center font-semibold">
            <div className="text-[13px] font-normal text-[#EC6668]">
              Out of Boundary{flagCount ? ` (${flagCount}x)` : ""}
            </div>
            <div className="w-4 h-4 rounded-full bg-[#EC6668]" />
          </div>
        </div>
      </div>
      <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />

      {isExpanded && (
        <>
          <div className="flex flex-col ">
            {excursions.map((ex) => (
              <div
                key={ex.id}
                className="flex justify-between text-[13px] text-[#3A3A3A]"
              >
                <span>{format(new Date(ex.out_at), "h:mm a")}</span>
                <span>→</span>
                <span>
                  {ex.in_at
                    ? format(new Date(ex.in_at), "h:mm a")
                    : "Still out"}
                </span>
              </div>
            ))}
            <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="self-start text-[12px] text-[#6675EC] hover:underline mt-1"
      >
        {isExpanded ? "Hide" : "Show"} Flags ({flagCount})
      </button>
    </div>
  );
}
