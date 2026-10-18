import { useState, useRef } from "react";
import { ChevronDown, User } from "lucide-react";

import axios from "axios";
import { url } from "@/resources/api";
import { notifySuccess, notifyError, confirmDialog } from "@/lib/dialog";
import FamilyTable from "@/components/FamilyTable";
import { cleanFamily } from "@/lib/family";
import Loading from "@/components/Loading";
import WorkingDaysField from "@/components/WorkingDaysField";
import DateInput from "@/components/DateInput";
import { latestBirthDate } from "@/lib/birthDate";
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
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [formKey, setFormKey] = useState(0);
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
    data.append("department", formData.department);
    data.append("position", formData.position);
    data.append("call_time", formData.callTime);
    data.append("contract_type", formData.contractType);
    data.append("employment_status", formData.employmentStatus ?? "");
    data.append("date_of_birth", formData.dob);
    data.append("gender", formData.gender);
    data.append("nationality", formData.nationality);
    data.append("address", formData.address);
    // government numbers (all optional; the server writes them with dashes)
    data.append("tin", formData.tin ?? "");
    data.append("sss_number", formData.sssNumber ?? "");
    data.append("philhealth_number", formData.philhealthNumber ?? "");
    data.append("pagibig_number", formData.pagibigNumber ?? "");
    // spouse and children, as a JSON list (shown on the profile only)
    data.append("family", JSON.stringify(cleanFamily(formData.family)));

    data.append("monthly_salary", formData.salary);
    data.append("working_hours_per_day", formData.wrkHrsPD);
    data.append("working_days_per_month", formData.wrkDPM);
    if (photoFile) data.append("image", photoFile);

    const confirmed = await confirmDialog(
      "Are the sure the inputs are correct",
      {
        title: "Create Employee",
        confirmLabel: "Create",
      },
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      const res = await axios.post(url + "/users", data, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (res.data.email_sent === false) {
        // shown only now, once: the email did not go out, so HR has to pass the password on
        notifyError(
          `The employee was added, but the email with their login could not be sent. Give them this temporary password yourself: ${res.data.temporary_password}`,
          "Employee added, email not sent",
        );
      } else {
        notifySuccess(
          "The employee was added and their login was emailed.",
          "Employee added",
        );
      }
    } catch (error) {
      console.error("Failed to create employee:", error);
      // the server says what is wrong (for example a number that is already used)
      const errors = error.response?.data?.errors;
      notifyError(
        errors ? Object.values(errors)[0][0] : "Could not create the employee.",
        "Could not add employee",
      );
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  const onCancel = async () => {
    const confirmed = await confirmDialog(
      "Are the sure you want to reset the inputs",
      {
        title: "Reset Inputs",
        confirmLabel: "Reset",
      },
    );
    if (!confirmed) return;
    setForm({});
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormKey((k) => k + 1);
  };
  return (
    <>
      {loading && <Loading />}
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#b2b2b2] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">
          Create Employee Account
        </h2>
      </div>

      <div className="bg-white border border-[#b2b2b2] rounded-[14px] p-6 md:p-8">
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
          key={formKey}
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
              <DateInput
                className={inputClass}
                max={latestBirthDate()}
                onChange={update("dob")}
              />
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
            {/* the login is sent here: a random password is made and emailed to this address */}
            <Field label="Email" required span={2}>
              <input
                type="email"
                className={inputClass}
                placeholder="Their login and temporary password are sent here"
                onChange={update("email")}
              />
            </Field>
          </Section>

          <Section title="Government IDs (optional)">
            <Field label="TIN">
              <input
                className={inputClass}
                placeholder="000-000-000-000"
                inputMode="numeric"
                maxLength={15}
                onChange={update("tin")}
              />
            </Field>
            <Field label="SSS No.">
              <input
                className={inputClass}
                placeholder="00-0000000-0"
                inputMode="numeric"
                maxLength={12}
                onChange={update("sssNumber")}
              />
            </Field>
            <Field label="PhilHealth No.">
              <input
                className={inputClass}
                placeholder="00-000000000-0"
                inputMode="numeric"
                maxLength={14}
                onChange={update("philhealthNumber")}
              />
            </Field>
            <Field label="Pag-IBIG No.">
              <input
                className={inputClass}
                placeholder="0000-0000-0000"
                inputMode="numeric"
                maxLength={14}
                onChange={update("pagibigNumber")}
              />
            </Field>
          </Section>

          <Section title="Family (optional)">
            <div className="sm:col-span-2 lg:col-span-4">
              <FamilyTable
                value={form.family}
                onChange={(family) => setForm((f) => ({ ...f, family }))}
              />
            </div>
          </Section>

          <Section title="Employment Details">
            <Field label="Department" required>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none pr-8`}
                  onChange={update("department")}
                >
                  <option value="">Select</option>
                  <option>Administrative</option>
                  <option>Basic Education</option>
                  <option>Special Need Education</option>
                  <option>Preschool</option>
                  <option>Mainstreaming</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
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
            <Field label="Employment Status" required>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none pr-8`}
                  onChange={update("employmentStatus")}
                >
                  <option value="">Select</option>
                  <option>Contractual</option>
                  <option>Permanent</option>
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
            {/* <Field label="Working Hours Per Day" required>
              <input
                type="number"
                className={inputClass}
                onChange={update("wrkHrsPD")}
              />
            </Field> */}
            {/* <Field label="Working Days Per Month" required>
              <WorkingDaysField
                value={form.wrkDPM}
                onChange={(v) => setForm((f) => ({ ...f, wrkDPM: v }))}
                className={inputClass}
              />
            </Field> */}
          </Section>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-full bg-[#EC6668] hover:bg-[#EC6668]/80 text-white font-medium"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#2AAF56] hover:bg-[#2AAF56]/80 text-white font-medium"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
