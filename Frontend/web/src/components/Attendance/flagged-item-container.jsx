export default function FlaggedItemContainer({
  name,
  department,
  position,
  location,
  date,
  flaggedAt,
}) {
  return (
    <div className="flex gap-1 flex-col min-w-[360px] border-1 border-[#EC6668] p-2 rounded-[5px]">
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
            <p className="text-[13px] text-[#EC6668]">Out of Boundary</p>
            <div className="w-4 h-4 rounded-full bg-[#EC6668]" />
          </div>
        </div>
      </div>
      <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />
      <div className="flex justify-between">
        <p className="font-semibold text-[16px]">Flagged At:</p>
        <p className="text-[16px]">{flaggedAt}</p>
      </div>
    </div>
  );
}
