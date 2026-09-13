export default function ItemContainer({
  id,
  name,
  department,
  position,
  contType,
  joinDate,
}) {
  const token = localStorage.getItem("token");
  const test = async (e) => {
    alert(token);
  };
  return (
    <>
      <div className="flex gap-1 flex-col min-w-[360px] border-1 border-[#b8b8b8] p-2 rounded-[5px]">
        <div className="flex justify-between">
          <div className="flex gap-1 items-center font-semibold">
            <p className="text-[16px]">ID - {id}</p>
          </div>
          <button
            onClick={test}
            type="button"
            className="w-20 bg-[#2AAF56] hover:bg-[#EC6668] rounded-full text-white py-0.5"
          >
            View
          </button>
        </div>
        {/* line */}
        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5 mx-0 px-0" />
        <div className="my-1">
          <div className="flex justify-between items-center ">
            <div className="flex gap-1 items-center">
              <div className="rounded-full w-15 h-15 border-1" />
              <div className="flex flex-col items-start">
                <p className="m-0 leading-none font-semibold text-[#3A3A3A] text-[16px]">
                  {name}
                </p>
                <p className="m-0 leading-none text-[#3A3A3A] text-[13px]">
                  {department} | {position}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* line */}
        <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5" />
        <div className="flex justify-between">
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
              {contType}
            </p>
            <p className="m-0 leading-none text-[16px] text-[#3A3A3A]">
              {joinDate}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
