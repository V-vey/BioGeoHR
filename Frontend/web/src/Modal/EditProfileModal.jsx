import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown, User } from "lucide-react";

import axios from "axios";
import { url } from "@/resources/api";
import Fallback from "@/assets/user.svg";
import AuthImage from "@/components/AuthImage";

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col flex-1 items-start">
      <p className="font-medium pl-2">{label}</p>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        className="w-full border border-[#b2b2b2] rounded-[10px] p-2"
      />
    </div>
  );
}
function Section({ label, children }) {
  return (
    <div className="flex flex-col gap-4 p-5 bg-white rounded-[10px] border border-[#b2b2b2] w-full">
      <h3 className="font-semibold text-[#3A3A3A] text-[21px]">{label}</h3>
      <div className="flex flex-col gap-2 ">{children}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  const hasValue = value && !options.includes(value);
  return (
    <div className="flex flex-col flex-1 items-start">
      <p className="font-medium pl-2">{label}</p>
      <select
        value={value ?? ""}
        onChange={onChange}
        className="w-full border border-[#b2b2b2] rounded-[10px] p-2 bg-white"
      >
        {hasValue && <option value={value}>{value}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
function SectionInside({ children }) {
  return <div className="flex flex-row items-center gap-2 ">{children}</div>;
}
export default function EdiPofiletModal({
  onClose,
  emp,
  empData,
  onSaved,
  onSavedAllEmployee,
}) {
  const [form, setForm] = useState(() => ({
    image: empData.image_path,
    name: empData.name,
    email: empData.email,
    contact_number: empData.contact_number,
    date_of_birth: empData.date_of_birth,
    nationality: empData.nationality,
    gender: empData.gender,
    address: empData.address,

    department: empData.department,
    position: empData.position,
    contract_type: empData.contract_type,
    salary_basis: empData.salary?.salary_basis,
    call_time: empData.call_time,
    working_hours_per_day: empData.salary?.working_hours_per_day,
    working_days_per_month: empData.salary?.working_days_per_month,
  }));
  const srvUrl = url.replace("/api", "/storage/");
  const fallbackImage = Fallback;
  const imageSrc = empData.image_path ? `${url}/${empData.image_path}` : null;

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
  const onCancel = () => {
    setForm({
      name: empData.name,
      email: empData.email,
      contact_number: empData.contact_number,
      department: empData.department,
      position: empData.position,
      call_time: empData.call_time,
      contract_type: empData.contract_type,
      date_of_birth: empData.date_of_birth,
      gender: empData.gender,
      nationality: empData.nationality,
      address: empData.address,
      salary_basis: empData.salary?.salary_basis,
      working_hours_per_day: empData.salary?.working_hours_per_day,
      working_days_per_month: empData.salary?.working_days_per_month,
      image: empData.image_path,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };

    const {
      salary_basis,
      working_hours_per_day,
      working_days_per_month,
      image,
      ...profile
    } = form;
    const data = new FormData();
    Object.entries(profile).forEach(([k, v]) => data.append(k, v ?? ""));
    if (photoFile) data.append("image", photoFile);
    data.append("_method", "PUT");
    try {
      await axios.post(url + `/users/${emp.id}`, data, { headers });
      if (empData.salary) {
        await axios.put(
          url + `/salary/${empData.salary.id}`,
          { salary_basis, working_hours_per_day, working_days_per_month },
          { headers },
        );
      }
      alert("Profile updated");
      onSaved?.();
      onSavedAllEmployee?.();
      onClose();
    } catch (error) {
      alert("Could not save changes.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="flex flex-col gap-2 bg-[#f2f2f2] rounded-xl p-6 min-w-[70%] max-w-[60%] max-h-[90%] overflow-y-auto  [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-row justify-between bg-white items-center px-4 py-3 rounded-[10px] border border-[#b2b2b2]">
          <button
            onClick={onClose}
            className="text-white bg-[#2AAF56] text-[20px] items-center rounded-[10px]  px-4 py-1 hover:bg-[#6675EC]"
          >
            ← Back
          </button>
          <h2 className="font-bold">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            {/* <div className="flex flex-row bg-white w-full border border-[#b2b2b2] rounded-[10px] p-4"> */}
            <Section label={"Personal Information"}>
              <SectionInside>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-20 h-20 rounded-[10px] border border-[#b2b2b2] bg-[#6675EC]/10 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={`${emp.name || "User"}'s Profile`}
                      className="object-cover scale-110"
                    />
                  ) : (
                    <AuthImage
                      src={imageSrc}
                      fallback={fallbackImage}
                      alt={`${emp.name || "User"}'s Profile`}
                      className="object-cover scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Change
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <Field
                  label={"Name"}
                  value={form.name}
                  onChange={update("name")}
                  type="text"
                />
                <Field
                  label={"Email"}
                  value={form.email}
                  onChange={update("email")}
                  type="email"
                />
                <Field
                  label={"Contact Number"}
                  value={form.contact_number}
                  onChange={update("contact_number")}
                  type="tel"
                />
              </SectionInside>
              <SectionInside>
                <Field
                  label={"Date of Birth"}
                  value={form.date_of_birth}
                  onChange={update("date_of_birth")}
                  type="date"
                />
                <Field
                  label={"Nationality"}
                  value={form.nationality}
                  onChange={update("nationality")}
                  type="text"
                />

                <Select
                  label="Gender"
                  value={form.gender}
                  onChange={update("gender")}
                  options={["Male", "Female"]}
                />
              </SectionInside>
              <Field
                label={"Address"}
                value={form.address}
                onChange={update("address")}
                type="text"
              />
            </Section>
            {/* </div> */}
            <Section label={"Employee Details"}>
              <SectionInside>
                <Select
                  label="Department"
                  value={form.department}
                  onChange={update("department")}
                  options={[
                    "Administrative",
                    "Basic Education",
                    "Special Need Education",
                    "Preschool",
                    "Mainstreaming",
                  ]}
                />

                <Field
                  label={"Position"}
                  value={form.position}
                  onChange={update("position")}
                  type="text"
                />
                <Select
                  label="Contract Type"
                  value={form.contract_type}
                  onChange={update("contract_type")}
                  options={["Probationary", "Regular"]}
                />
                <Field
                  label={"Salary Basis"}
                  value={form.salary_basis}
                  onChange={update("salary_basis")}
                  type="number"
                />
              </SectionInside>
              <SectionInside>
                <Field
                  label={"Call Time"}
                  value={form.call_time}
                  onChange={update("call_time")}
                  type="time"
                />
                <Field
                  label={"Working Hours Per Day"}
                  value={form.working_hours_per_day}
                  onChange={update("working_hours_per_day")}
                  type="number"
                />
                <Field
                  label={"Working Days Per Month"}
                  value={form.working_days_per_month}
                  onChange={update("working_days_per_month")}
                  type="number"
                />
              </SectionInside>
            </Section>
            <div className="flex flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-1 rounded-full border border-[#b2b2b2]"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded-full text-white bg-[#2AAF56] hover:bg-[#6675EC]"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
