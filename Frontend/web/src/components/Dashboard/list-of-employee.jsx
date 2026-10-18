import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";

export default function ListOfEmployee({ emp }) {
  if (emp.length === 0) {
    return (
      <p className="text-sm text-[#8a90a3] text-center py-4">
        No employees found.
      </p>
    );
  }

  // gap-3 keeps a long cell (e.g. "Grade School Teacher") off the next column; items-start puts the
  // status on the first line, level with the name, when a long name wraps to two lines
  return (
    <div className="flex flex-row items-start gap-3 px-4 w-full">
      <p className="flex-1 text-start font-regular">{emp.name}</p>
      <p className="flex-1 text-start">{emp.department}</p>
      <p className="flex-1 text-start">{emp.position}</p>
      <div className="flex-1 flex items-start justify-start gap-1.5 ">
        <span
          className={`w-3 h-3 mt-1.5 shrink-0 rounded-full ${
            emp.status === "On-Time"
              ? "bg-[#2AAF56]"
              : emp.status === "Late"
                ? "bg-[#EACA3A]"
                : emp.status === "On Leave"
                  ? "bg-[#6675EC]"
                  : emp.status === "Not Yet In" ||
                      emp.status === "Non-working day"
                    ? "bg-[#8a90a3]"
                    : "bg-[#EC6668]" // Absent
          }`}
        />
        <p className="m-0">{emp.status}</p>
      </div>
      <p className="flex-1 text-start">{emp.contractType}</p>
    </div>
  );
}
