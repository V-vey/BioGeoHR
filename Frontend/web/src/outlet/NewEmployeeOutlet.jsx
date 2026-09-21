import { useState, useRef } from "react";
import { Calendar, ChevronDown, User } from "lucide-react";

import axios from "axios";
import { url } from "@/resources/api";
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
    <div className="flex flex-col gap-4 py-6 border-b border-[#eef0f5] last:border-b-0">
      <h3 className="font-semibold text-[#3A3A3A]">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

export default function NewEmployeeForm() {
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

  const onSubmit = async (formData) => {
    const data = new FormData();
    data.append(
      "name",
      `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`.trim(),
    );
    data.append("email", formData.email);
    data.append("contact_number", formData.contactNumber);
    data.append("password", formData.password);
    data.append("department", formData.department);
    data.append("position", formData.position);
    data.append("call_time", formData.callTime);
    data.append("contract_type", formData.contractType);
    data.append("date_of_birth", formData.dob);
    data.append("gender", formData.gender);
    data.append("nationality", formData.nationality);
    data.append("address", formData.address);

    data.append("monthly_salary", formData.salary);
    data.append("working_hours_per_day", formData.wrkHrsPD);
    data.append("working_days_per_month", formData.wrkDPM);
    if (photoFile) data.append("image", photoFile);

    try {
      await axios.post(url + "/users", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      alert("New Employee Success");
    } catch (error) {
      console.error("Failed to create employee:", error);
    }
  };

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const onCancel = () => {};
  return (
    <>
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">Location</h2>
      </div>

      <div className="bg-white border border-[#eef0f5] rounded-[14px] p-6 md:p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-[#3A3A3A]">Employee Detail</h2>
          <p className="text-xs text-gray-400">
            <span className="text-[#EC6668]">*</span> Required field
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.(form);
          }}
        >
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
              <p className="text-xs text-gray-400">JPG or PNG, max 2MB</p>
            </div>
          </div>

          <Section title="Account Credentials">
            <Field label="Email" required>
              <input
                type="email"
                className={inputClass}
                onChange={update("email")}
              />
            </Field>
            <Field label="Password" required>
              <input
                type="password"
                className={inputClass}
                onChange={update("password")}
              />
            </Field>
            <Field label="Confirm Password" required>
              <input
                type="password"
                className={inputClass}
                onChange={update("confirmPassword")}
              />
            </Field>
          </Section>

          <Section title="Personal Information">
            <Field label="Last name" required>
              <input className={inputClass} onChange={update("lastName")} />
            </Field>
            <Field label="First name" required>
              <input className={inputClass} onChange={update("firstName")} />
            </Field>
            <Field label="Middle name">
              <input className={inputClass} onChange={update("middleName")} />
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
              <input className={inputClass} onChange={update("birthPlace")} />
            </Field>
            <Field label="Nationality" required>
              <input className={inputClass} onChange={update("nationality")} />
            </Field>
            <Field label="Contact No." required>
              <input
                type="tel"
                className={inputClass}
                onChange={update("contactNumber")}
              />
            </Field>
            <Field label="Address" required span={2}>
              <input className={inputClass} onChange={update("address")} />
            </Field>
          </Section>

          <Section title="Employment Details">
            <Field label="Department" required>
              <input className={inputClass} onChange={update("department")} />
            </Field>
            <Field label="Position" required>
              <input className={inputClass} onChange={update("position")} />
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
            <Field label="Standard Work Hours per day" required>
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
    </>
  );
}
