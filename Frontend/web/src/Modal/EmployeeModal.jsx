import axios from "axios";
import { url } from "@/resources/api";
import { useState, useEffect, useRef } from "react";
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
function Field({ label, required, span = 1, children }) {
  return (
    <div
      className={`flex flex-col  gap-1.5 ${span === 2 ? "sm:col-span-2" : ""}`}
    >
      <label className="text-sm text-gray-600 ">
        {label}
        {required && <span className="text-[#EC6668]">*</span>}
      </label>
      {children}
    </div>
  );
}
const inputClass =
  "w-full h-11 px-3 border border-[#b2b2b2] rounded-xl text-sm outline-none focus:border-[#6675EC] focus:ring-2 focus:ring-[#6675EC]/20 transition-colors";

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-4 border border-[#b2b2b2] bg-white p-4 last:border-b-0 rounded-[10px]">
      <h3 className="font-semibold text-[#3A3A3A]">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {children}
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
function LeaveItem({ fetch, status }) {
  let statusColor;
  // let status = "Approved";
  if (status == "Approved") {
    statusColor = "#2AAF56";
  } else if (status == "Pending") {
    statusColor = "#EACA3A";
  } else if (status == "Rejected") {
    statusColor = "#EC6668";
  }
  return (
    <div className="flex flex-col bg-white border border-[#b2b2b2] rounded-[10px] min-w-70">
      <div className="flex flex-row p-2 font-semibold justify-between">
        <div className="flex flex-row gap-2 items-center justify-end font-semibold">
          <div
            style={{ backgroundColor: statusColor }}
            className="w-4 h-4 rounded-full"
          />
          <p className="text-[16px]">{status}</p>
        </div>
        <button
          // onClick={}
          type="button"
          className="w-20 bg-[#2AAF56] hover:bg-[#EC6668] rounded-full text-white py-0.5"
        >
          View
        </button>
      </div>
      <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5 mx-0 px-0" />
      <div className="flex flex-col py-1 px-2">
        <div className=" flex flex-row justify-between">
          <p className="text-[15px] font-medium">Leave Type:</p>
          <p className="text-[15px] font-regular">Sick Leave</p>
        </div>
        <div className="  flex flex-row justify-between">
          <p className="text-[15px] font-medium">Date Range:</p>
          <p className="text-[15px] font-regular">
            Dec 28, 2004 - Dec 28, 2004
          </p>
        </div>
        <div className=" flex flex-row justify-between">
          <p className="text-[15px] font-medium">Number of Days:</p>
          <p className="text-[15px] font-regular">4 days</p>
        </div>
      </div>
    </div>
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

  const filteredLeave = leaves
    .filter((leave) =>
      leave.user?.name?.toLowerCase().includes(searchLeave.toLowerCase()),
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-5">
      <div className="flex flex-col gap-2 bg-[#f2f2f2] rounded-xl p-6 min-w-[70%] max-w-[60%] ">
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
                    <LeaveItem status={"Approved"} />
                    <LeaveItem status={"Approved"} />
                    <LeaveItem status={"Approved"} />
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
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  onSubmit?.(form);
                }}
                className="flex flex-col gap-2"
              >
                <Section title="Personal Information">
                  <div className="flex items-center gap-4 py-6 border-b border-[#eef0f5]">
                    <div className="w-16 h-16 rounded-full bg-[#6675EC]/10 flex items-center justify-center shrink-0 overflow-hidden">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-[#6675EC]" />
                      )}
                    </div>

                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-[#6675EC] font-medium hover:underline"
                      >
                        Upload photo
                      </button>
                      <p className="text-xs text-gray-400">
                        JPG or PNG, max 2MB
                      </p>
                    </div>
                  </div>
                  <Field label="Last name" required>
                    <input
                      className={inputClass}
                      onChange={update("lastName")}
                    />
                  </Field>
                  <Field label="First name" required>
                    <input
                      className={inputClass}
                      onChange={update("firstName")}
                    />
                  </Field>
                  <Field label="Middle name">
                    <input
                      className={inputClass}
                      onChange={update("middleName")}
                    />
                  </Field>
                  <Field label="Gender" required>
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none pr-8`}
                        onChange={update("gender")}
                      >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Date of Birth" required>
                    <div className="relative">
                      <input
                        type="date"
                        className={`${inputClass} pr-9`}
                        onChange={update("dob")}
                      />
                      <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Birth place">
                    <input
                      className={inputClass}
                      onChange={update("birthPlace")}
                    />
                  </Field>
                  <Field label="Nationality" required>
                    <input
                      className={inputClass}
                      onChange={update("nationality")}
                    />
                  </Field>
                  <Field label="Contact No." required>
                    <input
                      type="tel"
                      className={inputClass}
                      onChange={update("contactNumber")}
                    />
                  </Field>
                  <Field label="Address" required span={2}>
                    <input
                      className={inputClass}
                      onChange={update("address")}
                    />
                  </Field>
                </Section>

                <Section title="Employment Details">
                  <Field label="Department" required>
                    <input
                      className={inputClass}
                      onChange={update("department")}
                    />
                  </Field>
                  <Field label="Position" required>
                    <input
                      className={inputClass}
                      onChange={update("position")}
                    />
                  </Field>
                  <Field label="Contract Type" required>
                    <div className="relative">
                      <select
                        className={`${inputClass} appearance-none pr-8`}
                        onChange={update("contractType")}
                      >
                        <option value="">Select</option>
                        <option>Probationary</option>
                        <option>Regular</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Monthly Salary" required>
                    <input
                      type="number"
                      className={inputClass}
                      onChange={update("salary")}
                    />
                  </Field>
                  <Field label="Call Time" required>
                    <input
                      type="time"
                      className={inputClass}
                      onChange={update("callTime")}
                    />
                  </Field>
                  <Field label="Working Hours Per Day" required>
                    <input
                      type="number"
                      className={inputClass}
                      onChange={update("wrkHrsPD")}
                    />
                  </Field>
                  <Field label="Working Days Per Month" required>
                    <input
                      type="number"
                      className={inputClass}
                      onChange={update("wrkDPM")}
                    />
                  </Field>
                </Section>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2 rounded-full border border-[#eef0f5] text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-[#2AAF56] hover:bg-[#249c4c] text-white font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}
          {/* <div className="h-[1px] w-full m-0 bg-[#b2b2b2] my-0.5 " /> */}
        </div>
      </div>
    </div>
  );
}
