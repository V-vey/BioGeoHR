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
    // w-full: the card fills its cell in the page's grid, so every card is the same width;
    // min-w-0 and break-words let a long name or department wrap instead of pushing the card wider
    <div className="flex gap-1 flex-col w-full min-w-0 border-1 border-[#b8b8b8] p-2 rounded-[5px]">
      <div className="flex justify-between gap-3">
        <p className="text-[16px] font-semibold text-[#3A3A3A]">{date}</p>
        <p className="text-[16px] font-semibold text-right min-w-0 truncate">
          {location}
        </p>
      </div>
      <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />
      <div className="my-1">
        <div className="flex justify-between items-center gap-3">
          <div className="flex flex-col items-start min-w-0">
            <p className="m-0 leading-tight text-left font-semibold text-[#3A3A3A] text-[16px] max-w-full break-words">
              {name}
            </p>
            <p className="m-0 leading-tight text-left text-[#3A3A3A] text-[13px] max-w-full break-words">
              {department} | {position}
            </p>
          </div>
          <div className="flex gap-1 items-center font-semibold shrink-0">
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
