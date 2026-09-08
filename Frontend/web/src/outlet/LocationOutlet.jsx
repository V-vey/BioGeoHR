import Maps from "@/components/Map";
import MapControllers from "@/components/map-controller";

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
      <div className="flex flex-row  justify-end mb-4 p-4 md:p-[16px_20px] bg-white border border-[#eef0f5] rounded-[14px] gap-4">
        <div className="flex-2">
          <Maps
            centerLat={centerLat}
            centerLng={centerLng}
            zoom={zoom}
            viewport={viewport}
            setViewport={setViewport}
          />
        </div>
        <div className="flex-1">
          <MapControllers
            centerLat={viewport.center[1]?.toFixed(8)}
            centerLng={viewport.center[0]?.toFixed(8)}
            zoom={zoom}
          />
        </div>
      </div>
    </div>
  );
}
