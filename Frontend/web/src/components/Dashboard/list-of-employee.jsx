import { useEffect, useState } from "react";
import axios from "axios";
import { url } from "@/resources/api";

export default function ListOfEmployee({ emp }) {
  if (emp.length === 0) {
    return (
      <p className="text-sm text-[#8a90a3] text-center py-4">
        No attendance recorded today.
      </p>
    );
  }

  return (
    <div className="flex flex-row px-4 w-full">
      <p className="flex-1 text-start font-regular">{emp.name}</p>
      <p className="flex-1 text-start">{emp.department}</p>
      <p className="flex-1 text-start">{emp.position}</p>
      <div className="flex-1 flex items-center justify-start gap-1.5 ">
        <span
          className={`w-3 h-3 rounded-full ${
            emp.status === "On-Time"
              ? "bg-[#2AAF56]"
              : emp.status === "Late"
                ? "bg-[#EACA3A]"
                : "bg-gray-400"
          }`}
        />
        <p className="m-0">{emp.status}</p>
      </div>
      <p className="flex-1 text-start">{emp.contractType}</p>
    </div>
  );
}
