export default function FlaggedSummary({ flagged }) {
  if (!flagged) {
    return (
      <p className="text-sm text-[#8a90a3] text-center py-4">
        No flagged attendance.
      </p>
    );
  }

  return (
    <div className="flex flex-col w-full px-3">
      <div
        // key={flagged.id}
        className="flex items-center justify-between  "
      >
        <div className="flex gap-1 items-center">
          {/* IMAGE */}
          <div className="rounded-full w-10 h-10 border-1" />
          <div className="flex flex-col items-start">
            <p className="m-0 leading-none font-semibold text-[#3A3A3A] text-[18px]">
              {flagged.user?.name}
            </p>
            <p className="m-0 leading-none text-[#8a90a3] text-[15px]">
              {flagged.location?.name}
            </p>
          </div>
        </div>
        <div className="text-[13px] font-semibold text-[#EC6668]">
          {flagged.flagged_attendances_count}x
        </div>
      </div>
    </div>
  );
}
