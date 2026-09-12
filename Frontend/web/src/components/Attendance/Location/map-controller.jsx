export default function MapController({ centerLng, centerLat, zoom }) {
  return (
    <div className="flex justify-end min-h-[500px] mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
      <div className="flex-col w-full">
        <h2 className="flex items-start">Create Location</h2>
        <div className="h-2" />

        <div className="h-px w-full m-0 bg-[#4C4C4C] my-0.5 " />

        <form action="onSubmit">
          <div className="flex flex-col gap-2 my-2 ">
            <input
              required
              type="text"
              name="locationName"
              id="locationName"
              placeholder="Location Name"
              className="w-full border rounded-[7px] border-[#4C4C4C] px-2"
            />
            <div className="flex flex-row flex-wrap gap-2 w-full justify-center ">
              <div className="flex flex-1 flex-col border rounded-[7px] border-[#4C4C4C]">
                <p className="flex justify-center font-medium text-[#4C4C4C]">
                  Latitude
                </p>
                <div className=" h-px w-full m-0 bg-[#4C4C4C] my-0.5" />
                <input
                  type="number"
                  name="latitude"
                  id="latitude"
                  className="text-center"
                  value={centerLat}
                />
              </div>
              <div className="flex flex-1 flex-col border rounded-[7px] border-[#4C4C4C]">
                <p className="flex justify-center font-medium text-[#4C4C4C]">
                  Longitude:
                </p>
                <div className="h-[1px] w-full m-0 bg-[#4C4C4C] my-0.5" />
                <input
                  type="number"
                  name="longitude"
                  id="longitude"
                  className="text-center"
                  value={centerLng}
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 border rounded-[7px] border-[#4C4C4C] p-2">
              <p className="flex items-start">Radius:</p>

              <input
                type="range"
                name="radius"
                id="radius"
                // min={100}
                // max={200}
                // value={1}
                className="
                    w-full h-1.5 rounded-full 
                
                "
              />
            </div>
            <div className="flex w-full border">
              <input
                type="button"
                value="Submit"
                className="flex flex-row justify-end items-end bg-amber-400"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
