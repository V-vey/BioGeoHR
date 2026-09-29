import axios from "axios";
import { url } from "@/resources/api";
import { useState, useEffect } from "react";
import { Mars, Venus, Users } from "lucide-react";
import Counts from "@/components/Dashboard/counts";
function Balance(type, item) {
  return (
    <div className="flex flex-1 flex-row justify-between items-center bg-white w-full px-4 py-3 border border-[#b2b2b2] rounded-[10px] font-medium ">
      <p>{type} </p>
      <p>{item}</p>
    </div>
  );
}

export default function EmployeeModal({ emp, onClose }) {
  const [isOverview, setIsOverview] = useState(true);
  const colorNav = "#6675EC";
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="flex flex-col gap-2 bg-[#f2f2f2] rounded-xl p-6 min-w-[70%] max-w-[60%] min-h-[80%] max-h-[80%] ">
        <div className="flex flex-row justify-between bg-white items-center px-4 py-3 rounded-[10px] border border-[#b2b2b2]">
          <button
            onClick={onClose}
            className="text-white bg-[#2AAF56] text-[20px] items-center rounded-[10px]  px-4 py-1 hover:bg-[#6675EC]"
          >
            ← Back
          </button>
          <h2 className="font-bold">Employee Profile</h2>
        </div>
        <div className="flex flex-col gap-2 w-full h-full ">
          <div className="flex flex-row justify-center gap-10 py-2 bg-white border border-[#b2b2b2] rounded-[10px]">
            <button
              onClick={() => setIsOverview(true)}
              className={`pb-1 border-b-2 transition-colors ${
                isOverview === true
                  ? "text-[#6675EC] border-[#6675EC] font-semibold"
                  : "text-gray-500 border-transparent hover:text-[#6675EC]"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setIsOverview(false)}
              className={`pb-1 border-b-2 transition-colors ${
                isOverview === false
                  ? "text-[#6675EC] border-[#6675EC] font-semibold"
                  : "text-gray-500 border-transparent hover:text-[#6675EC]"
              }`}
            >
              Personal Info
            </button>
          </div>
          {isOverview ? (
            <div className="flex flex-row gap-2 ">
              <div className="flex-4 flex flex-row gap-2">
                <div className="flex flex-col w-full">
                  {/* employee info */}
                  <div className="flex flex-row gap-2 w-full">
                    <div className="flex flex-row items-center gap-2 bg-white  px-4 py-3 border border-[#b2b2b2] rounded-[10px]">
                      <div className="border rounded-[10px] w-20 h-20" />
                      <div className="flex flex-col gap-4 h-full py-2">
                        <div className="flex flex-col items-start">
                          <div className="flex flex-row w-full justify-between">
                            <p className="m-0 leading-none text-[16px] font-medium">
                              {emp.name}
                            </p>
                            {emp.gender === "Male" ? (
                              <Mars className="w-4 h-4 text-[#6675EC]" />
                            ) : (
                              <Venus className="w-4 h-4 text-[#EC6668]" />
                            )}
                          </div>

                          <p className="m-0 leading-none text-[13px] font-regular">
                            {emp.email}
                          </p>
                          <p className="m-0 leading-none text-[13px] font-regular">
                            {emp.contact_number}
                          </p>
                        </div>
                        <div className="flex flex-col justify-end items-end">
                          <p className="m-0 leading-none text-[13px] font-medium">
                            {emp.department} | {emp.position}
                          </p>
                          <p className="m-0 leading-none text-[13px] font-regular">
                            {emp.contract_type}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* personal info */}
                    <Counts
                      className="flex-1 "
                      display="Total Employees"
                      count={"100"}
                      icon={
                        <Users className="text-[#6675EC] w-10 h-10 text-[20px] " />
                      }
                    />
                    <Counts
                      className="flex-1 "
                      display="Total Employees"
                      count={"100"}
                      icon={
                        <Users className="text-[#6675EC] w-10 h-10 text-[20px] " />
                      }
                    />
                    {/* <div className="flex flex-row items-center gap-2 bg-white w-full px-4 py-3 border border-[#b2b2b2] rounded-[10px]">
                      <div className="flex flex-row w-full justify-between">
                        <p className="m-0 leading-none text-[13px] font-regular">
                          Gender
                        </p>
                      </div>
                    </div> */}
                    {/* <div className="flex flex-row items-center gap-2 bg-white w-full px-4 py-3 border border-[#b2b2b2] rounded-[10px]"></div> */}
                  </div>
                </div>
              </div>
              {/* <div className="flex-2 flex flex-col w-full"></div> */}
              <div className="flex-1 flex flex-col  gap-2 ">
                <div className="flex-1items-center bg-white w-full px-4 py-3.5 border border-[#b2b2b2] rounded-[10px] ">
                  <p className="text-[#b2b2b2] text-[20px] font-bold text-start">
                    Leave Balance:
                  </p>
                </div>
                {Balance("Sick Leave: ")}
                {Balance("Vacation Leave: ")}
                {Balance("Emergency Leave: ")}
                {Balance("Birthday Leave: ")}
                {Balance("Solo Parent Leave: ")}
                {Balance("Paternity Leave: ")}
                {Balance("Maternity Leave: ")}
              </div>
            </div>
          ) : (
            <div>Su</div>
          )}
          {/* <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5 " /> */}
        </div>
      </div>
    </div>
  );
}
