import { format, parse, differenceInMinutes } from "date-fns";

export default function ItemContainer({
  date,
  location,
  name,
  department,
  position,
  status,
  clockIn,
  clockOut,
  hours,
}) {
  let statusColor;
  if (status == "On-Time") {
    statusColor = "#2AAF56";
  } else if (status == "Late") {
    statusColor = "#EACA3A";
  } else if (status == "Absent") {
    statusColor = "#EC6668";
  } else if (status == "Leave") {
    statusColor = "#6675EC";
  }
  return (
    <>
      <div className="flex gap-1 flex-col min-w-[360px] border-1 border-[#b8b8b8] p-2 rounded-[5px]">
        <div className="flex justify-between">
          <p className="text-[16px] font-semibold text-[#3A3A3A]">{date}</p>
          <p className="text-[16px] font-semibold">{location}</p>
        </div>
        {/* line */}
        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />
        <div className="my-1">
          <div className="flex justify-between items-center ">
            <div className="flex flex-col items-start">
              <p className="m-0 leading-none font-semibold text-[#3A3A3A] text-[16px]">
                {name}
              </p>
              <p className="m-0 leading-none text-[#3A3A3A] text-[13px]">
                {department} | {position}
              </p>
            </div>
            <div className="flex gap-1 items-center font-semibold">
              <p className="text-[16px]">{status}</p>
              <div
                style={{ backgroundColor: statusColor }}
                className="w-4 h-4 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* line */}
        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />
        <div className="flex flex-row w-full flex-1 justify-center items-center">
          <div className="flex-1 ">
            <p className="m-0 leading-none  font-semibold text-[16px]">
              Clock-In
            </p>
            <p className="m-0 leading-none  text-[16px]">{clockIn}</p>
          </div>
          <div className="flex-1">
            <p className="m-0 leading-none font-semibold text-[16px]">
              Clock-Out
            </p>
            <p className="m-0 leading-none  text-[16px]">{clockOut}</p>
          </div>
          <div className="flex-1">
            <p className="m-0 leading-none font-semibold text-[16px]">Hours</p>
            <p className="m-0 leading-none  text-[16px]">{hours}</p>
          </div>
        </div>
      </div>
    </>
  );
}
