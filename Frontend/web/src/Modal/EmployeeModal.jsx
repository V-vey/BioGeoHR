import axios from "axios";
import { url } from "@/resources/api";
import { useState, useEffect, useRef } from "react";
import LeaveRequestModal from "@/Modal/LeaveModal";
import {
  Mars,
  Venus,
  Users,
  User,
  TriangleAlert,
  History,
  Clock,
  Hourglass,
  Wallet,
  ChevronDown,
  Calendar,
} from "lucide-react";
import Containers from "@/components/container";

function ProfInf({ label, data }) {
  return (
    <div className="flex flex-col flex-1 justify-start items-start ">
      <p className="font-medium pl-2">{label}</p>
      <div className="flex flex-col flex-1 justify-start items-start border border-[#b2b2b2] rounded-[10px] p-2 w-full">
        {/* Change to Input */}
        <p className="font-regular">{data}</p>
      </div>
    </div>
  );
}
function Balance(type, item) {
  return (
    <div className="flex flex-1 flex-row justify-between items-center bg-white w-full px-4 py-3 border border-[#b2b2b2] rounded-[10px] font-medium ">
      <p>{type} </p>
      <p>{item}</p>
    </div>
  );
}
function SalaryRow({ icon: Icon, bg, iconColor, label, value }) {
  return (
    <div className="w-full flex items-center gap-3 border border-[#b2b2b2] bg-white  rounded-[10px] px-3 py-2.5">
      <div
        className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: iconColor }} />
      </div>
      <div className="flex flex-col justify-start items-start">
        <p className="m-0 text-xs text-[#8a90a3]">{label}</p>
        <p className="m-0 text-[15px] font-medium text-[#3A3A3A]">{value}</p>
      </div>
    </div>
  );
}
function LeaveItem({ fetch }) {
  const [viewLeave, setViewLeave] = useState(false);
  const onViewLeave = () => {
    setViewLeave(true);
  };

  let statusColor;
  // let status = "Approved";
  if (fetch?.status == "Approved") {
    statusColor = "#2AAF56";
  } else if (fetch?.status == "Pending") {
    statusColor = "#EACA3A";
  } else if (fetch?.status == "Rejected") {
    statusColor = "#EC6668";
  }
  return (
    <>
      <div className="flex flex-col bg-white border border-[#b2b2b2] rounded-[10px] min-w-70">
        <div className="flex flex-row p-2 font-semibold justify-between">
          <div className="flex flex-row gap-2 items-center justify-end font-semibold">
            <div
              style={{ backgroundColor: statusColor }}
              className="w-4 h-4 rounded-full"
            />
            <p className="text-[16px]">{fetch.status}</p>
          </div>
          <button
            onClick={onViewLeave}
            type="button"
            className="w-20 bg-[#2AAF56] hover:bg-[#EC6668] rounded-full text-white py-0.5"
          >
            View
          </button>
        </div>
        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5 mx-0 px-0" />
        <div className=" m-0 my-1 leading-none flex flex-col py-1 px-2">
          <div className="flex flex-row justify-between">
            <p className="text-[15px] font-medium">Leave Type:</p>
            <p className="text-[15px] font-regular">{fetch.leave_type}</p>
          </div>
          <div className="m-0 my-1 leading-none flex flex-row justify-between">
            <p className="text-[15px] font-medium">Starting Date:</p>
            <p className="text-[15px] font-regular">{fetch.start_date}</p>
          </div>
          <div className="m-0 leading-none flex flex-row justify-between">
            <p className="text-[15px] font-medium">Ending Date:</p>
            <p className="text-[15px] font-regular">{fetch.end_date}</p>
          </div>
        </div>
      </div>
      {viewLeave && (
        <LeaveRequestModal leave={fetch} onClose={() => setViewLeave(false)} />
      )}
    </>
  );
}
export default function EmployeeModal({ emp, onClose }) {
  const [isOverview, setIsOverview] = useState(true);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [salary, setSalary] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [searchLeave, setSearchLeave] = useState("");
  const [currentPageLeave, setCurrentPageLeave] = useState(1);

  const [empData, setEmpData] = useState(null);

  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const onCancel = () => {};

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(url + `/user/${emp.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });
        setEmpData(response.data);
      } catch (error) {
        console.error("Failed to load employee overview data:", error);
      }
    };

    fetchData();
  }, [emp.id]);
  if (!empData) {
    return <div>LOADING..</div>;
  }
  const filteredLeave = empData?.leave_application
    .filter((leave) =>
      leave?.status?.toLowerCase().includes(searchLeave.toLowerCase()),
    )
    .reverse();

  const itemsPerPageLeave = 3;

  const totalPagesLeave = Math.max(
    1,
    Math.ceil(filteredLeave.length / itemsPerPageLeave),
  );
  const startIndexLeave = (currentPageLeave - 1) * itemsPerPageLeave;
  const pageItemsLeave = filteredLeave.slice(
    startIndexLeave,
    startIndexLeave + itemsPerPageLeave,
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50  p-5">
      <div className="flex flex-col gap-2 bg-[#f2f2f2] rounded-xl p-6 min-w-[70%] max-w-[60%]">
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
                <div className="flex flex-col gap-2 w-full">
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
                    <div className="flex flex-col gap-2 bg-white w-full p-2 rounded-[10px]  border border-[#b2b2b2]">
                      <h2>On-Time</h2>
                      <div className="flex flex-row items-center justify-between gap-2 bg-white w-full px-4 py-3 border border-[#b2b2b2] rounded-[10px]">
                        <p className="text-[26px] font-medium text-[#b2b2b2] ">
                          {empData?.on_time}
                        </p>
                        <Clock className="text-[#2AAF56] w-10 h-10 text-[10px] " />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 bg-white w-full p-2 rounded-[10px]  border border-[#b2b2b2]">
                      <h2>Late</h2>
                      <div className="flex flex-row items-center justify-between gap-2 bg-white w-full px-4 py-3 border border-[#b2b2b2] rounded-[10px]">
                        <p className="text-[26px] font-medium text-[#b2b2b2] ">
                          {empData?.late}
                        </p>

                        <History className="text-[#EACA3A] w-10 h-10 text-[10px] " />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 bg-white w-full p-2 rounded-[10px]  border border-[#b2b2b2]">
                      <h2>Absent</h2>
                      <div className="flex flex-row items-center justify-between gap-2 bg-white w-full px-4 py-3 border border-[#b2b2b2] rounded-[10px]">
                        <p className="text-[26px] font-medium text-[#b2b2b2] ">
                          {empData?.absent}
                        </p>
                        <TriangleAlert className="text-[#EC6668] w-10 h-10 text-[10px] " />
                      </div>
                    </div>
                  </div>
                  {/* salary */}
                  <div className="flex flex-row w-full gap-2">
                    <SalaryRow
                      icon={Clock}
                      iconColor="#6675EC"
                      bg={"#EFF1FD"}
                      label="Salary per hour"
                      value={
                        salary
                          ? `₱${(salary.salary_basis / salary.working_days_per_month / salary.working_hours_per_day).toFixed(2)} / hr`
                          : "—"
                      }
                    />
                    <SalaryRow
                      icon={Hourglass}
                      iconColor="#8a6d10"
                      bg={"#FCF7E2"}
                      label="Overtime this period"
                      value={`100 · ₱100`}
                    />
                    <SalaryRow
                      icon={Wallet}
                      iconColor="#2AAF56"
                      bg={"#E5F5EA"}
                      label="Monthly salary"
                      value={salary ? `₱${salary.salary_basis}` : "—"}
                    />
                  </div>

                  <Containers
                    name="Pending Leave"
                    currentPage={currentPageLeave}
                    setCurrentPage={setCurrentPageLeave}
                    searchShow={false}
                    arrowSize={32}
                    minH={350}
                    maxH={350}
                    // header={leaveHeader}
                    // headerDefault={false}
                  >
                    {pageItemsLeave && pageItemsLeave.length > 0 ? (
                      pageItemsLeave.map((leave, i) => (
                        <LeaveItem key={i} fetch={leave} />
                      ))
                    ) : (
                      <p>No leave data available.</p>
                    )}
                  </Containers>
                </div>
              </div>
              <div className="flex-1 flex flex-col  gap-2 ">
                <div className="flex-1items-center bg-white w-full px-4 py-3.5 border border-[#b2b2b2] rounded-[10px] ">
                  <p className="text-[#b2b2b2] text-[20px] font-bold text-start">
                    Leave Balance:
                  </p>
                </div>
                {Balance("Sick Leave: ", empData?.leave_balance?.sick)}
                {Balance("Vacation Leave: ", empData?.leave_balance?.vacation)}
                {Balance(
                  "Emergency Leave: ",
                  empData?.leave_balance?.emergency,
                )}
                {Balance("Birthday Leave: ", empData?.leave_balance?.birthday)}
                {Balance(
                  "Solo Parent Leave: ",
                  empData?.leave_balance?.solo_parent,
                )}
                {Balance(
                  "Paternity Leave: ",
                  empData?.leave_balance?.paternity,
                )}
                {Balance(
                  "Maternity Leave: ",
                  empData?.leave_balance?.maternity,
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-4 p-5 bg-white rounded-[10px] border border-[#b2b2b2]">
                <h3 className="font-semibold text-[#3A3A3A] text-[21px]">
                  Personal Information
                </h3>
                <div className="flex flex-row items-center gap-4  ">
                  <div className="w-20 h-20 rounded-[10px] border border-[#b2b2b2] bg-[#6675EC]/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-[#6675EC] font-medium"
                      >
                        <User className="w-10 h-10 text-[#6675EC]" />
                      </button>
                    )}
                  </div>
                  <ProfInf label={"Name: "} data={emp.name} />
                  <ProfInf label={"Email: "} data={emp.email} />
                  <ProfInf
                    label={"Contact Number: "}
                    data={emp.contact_number}
                  />
                </div>
                <div className="flex flex-row gap-2 w-full">
                  <ProfInf label={"Gender: "} data={emp.gender} />
                  <ProfInf label={"Date of Birth: "} data={emp.date_of_birth} />
                  <ProfInf label={"Nationality: "} data={emp.nationality} />
                </div>
                <div className="flex flex-row gap-2">
                  <div className="flex-2">
                    <ProfInf label={"Address: "} data={emp.address} />
                  </div>
                  <div className="flex-1"></div>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5 bg-white rounded-[10px] border border-[#b2b2b2]">
                <h3 className="font-semibold text-[#3A3A3A] text-[21px]">
                  Employee Details
                </h3>
                <div className="flex flex-row items-center gap-2 ">
                  <ProfInf label={"Department: "} data={emp.department} />
                  <ProfInf label={"Position: "} data={emp.position} />
                  <ProfInf label={"Contract Type: "} data={emp.contract_type} />
                  <ProfInf label={"Call Time: "} data={emp.call_time} />
                </div>
              </div>
              <div className="flex flex-row gap-2 justify-end">
                <button
                  // onClick={}
                  type="button"
                  className="px-4 py-2 bg-[#2AAF56] hover:bg-[#EC6668] rounded-full text-white py-0.5"
                >
                  Reset Password
                </button>
                <button
                  // onClick={}
                  type="button"
                  className="w-20 bg-[#2AAF56] hover:bg-[#6675EC] rounded-full text-white py-0.5"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
          {/* <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5 " /> */}
        </div>
      </div>
    </div>
  );
}
