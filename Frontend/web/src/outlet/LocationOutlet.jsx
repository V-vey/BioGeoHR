import Maps from "@/components/Attendance/Location/Map";
import MapControllers from "@/components/Attendance/Location/map-controller";
import Items from "@/components/Attendance/Location/location-items";

import TestMap from "@/components/Attendance/Location/testMap";
import { useEffect, useRef, useState } from "react";
import { Map, MapControls } from "@/components/ui/map";
export default function Location() {
  let centerLng = 124.66181861;
  let centerLat = 13.26533063;
  let zoom = 4.0;

  const [viewport, setViewport] = useState({
    center: [centerLng, centerLat],
    zoom: zoom,
  });

  return (
    <div className="flex flex-col">
      <div className=" flex justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px]">
        <h2 className="text-[#6675EC] font-bold justify-end">Location</h2>
      </div>
      <div className="flex flex-row  justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px] gap-4">
        <div className="flex-2">
          {/* <Maps
            centerLat={centerLat}
            centerLng={centerLng}
            zoom={zoom}
            viewport={viewport}
            setViewport={setViewport}
            geofenceCircle={geofenceCircle}
          /> */}
          <TestMap radiusMeters={100} />
        </div>
        <div className="flex-1">
          <MapControllers
            centerLat={viewport.center[1]?.toFixed(8)}
            centerLng={viewport.center[0]?.toFixed(8)}
            zoom={zoom}
          />
        </div>
      </div>
      <div>
        <Items
          centerLat={viewport.center[1]?.toFixed(8)}
          centerLng={viewport.center[0]?.toFixed(8)}
          zoom={zoom}
        />
      </div>
    </div>
  );
}
