export default function MapController({ centerLng, centerLat, zoom }) {
  return (
    <div className="flex justify-end min-h-[500px] mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
      <div className="flex-col w-full">
        <h2 className="flex items-start">Create Location</h2>
        <div className="h-2" />
        <div className="h-[1px] w-full m-0 bg-[#E0E0E0] my-0.5" />
        <form action="onSubmit">
          <div className="flex-col my-2">
            <input
              type="text"
              name="locationName"
              id="locationName"
              placeholder="Location Name"
              className="w-full border-1"
            />
            <div className="flex flex-row flex-wrap gap-4 w-full justify-center w-full">
              <div className="flex flex-col border-1">
                <p className="flex justify-start">Latitude:</p>
                <div className="h-[1px] w-full m-0 bg-[#E0E0E0] my-0.5" />
                <input
                  type="number"
                  name="latitude"
                  id="latitude"
                  className=""
                  value={centerLat}
                />
              </div>
              <div>
                <input
                  type="number"
                  name="longitude"
                  id="longitude"
                  className="flex-1"
                  value={centerLng}
                />
              </div>
            </div>

            <input type="range" name="radius" id="radius" />
            <br />
            <div className="flex w-full">
              <input type="button" value="submit" className="items-end" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
