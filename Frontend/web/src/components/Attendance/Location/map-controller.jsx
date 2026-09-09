export default function MapController({ centerLng, centerLat, zoom }) {
  return (
    <div className="flex justify-end min-h-[500px] mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
      <div className="flex-col w-full">
        <h2 className="flex items-start">Create Location</h2>
        <div className="h-2" />
        <div className="h-[1px] w-full m-0 bg-[#E0E0E0] my-0.5" />
        <form action="onSubmit">
          <div className="flex-col ">
            <input
              type="text"
              name="locationName"
              id="locationName"
              placeholder="Location Name"
              className="w-full"
            />
            <div className="flex-row gap-4 w-full">
              <span>
                Latitude:
                <input
                  type="number"
                  name="latitude"
                  id="latitude"
                  className="flex-1"
                  value={centerLat}
                />
              </span>

              <input
                type="number"
                name="longitude"
                id="longitude"
                className="flex-1"
                value={centerLng}
              />
            </div>
            <input type="range" name="radius" id="radius" />
            <br />
            <div className="flex w-full bg-amber-100">
              <input type="button" value="submit" className="items-end" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
