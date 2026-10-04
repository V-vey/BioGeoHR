import EmployeeModal from "@/Modal/EmployeeModal";
import { useEffect, useState } from "react";
import { url } from "@/resources/api";
import Fallback from "@/assets/user.svg";
import AuthImage from "@/components/AuthImage";
export default function ItemContainer({ item, onSaved }) {
  const [view, setView] = useState(false);

  const createdAt = new Date(item.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const srvUrl = url.replace("/api", "/storage/");
  const fallbackImage = Fallback;
  const imageSrc = item.image_path
    ? `${url}/${item.image_path}`
    : null;
  const onView = () => {
    setView(true);
  };
  return (
    <>
      <div className="flex gap-1 flex-col min-w-[360px] border-1 border-[#b8b8b8] py-2 rounded-[5px]">
        <div className="flex px-2 justify-between">
          <div className="flex gap-1 items-center font-semibold">
            <p className="text-[16px]">ID - {item.id}</p>
          </div>
          <button
            onClick={onView}
            type="button"
            className="w-20 bg-[#2AAF56] hover:bg-[#EC6668] rounded-full text-white py-0.5"
          >
            View
          </button>
        </div>
        {/* line */}
        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5 mx-0 px-0" />
        <div className="my-1 px-2">
          <div className="flex justify-between items-center ">
            <div className="flex gap-1 items-center">
              {/* IMAGE */}
              <div className="flex rounded-full w-13 h-13 border items-center overflow-hidden">
                <AuthImage
                  src={imageSrc}
                  fallback={fallbackImage}
                  alt={`${item.name || "User"}'s Profile`}
                  className="object-cover scale-110"
                />
              </div>

              <div className="flex flex-col items-start">
                <p className="m-0 leading-none font-semibold text-[#3A3A3A] text-[16px]">
                  {item.name}
                </p>
                <p className="m-0 leading-none text-[#3A3A3A] text-[13px]">
                  {item.department} | {item.position}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* line */}
        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />
        <div className="flex justify-between px-2">
          <div className="flex flex-col items-start ">
            <p className="m-0 leading-none text-[16px] text-[#3A3A3A]">
              Contract Type:
            </p>
            <p className="m-0 leading-none text-[16px] text-[#3A3A3A]">
              Join Date:
            </p>
          </div>
          <div className="flex flex-col items-end">
            <p className="m-0 leading-none text-[16px] text-[#3A3A3A]">
              {item.contract_type}
            </p>
            <p className="m-0 leading-none text-[16px] text-[#3A3A3A]">
              {createdAt}
            </p>
          </div>
        </div>
      </div>
      {view && (
        <EmployeeModal
          emp={item}
          onSaved={onSaved}
          onClose={() => setView(false)}
        />
      )}
    </>
  );
}
