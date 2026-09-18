import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { url } from "@/resources/api";

//trial
import {
  Map,
  MapControls,
  MapGeoJSON,
  useMap,
  MapMarker,
} from "@/components/ui/map";

import circle from "@turf/circle";

export default function Items({ name, centerLng, centerLat, radius }) {
  const mapRef = useRef(null);
  const [viewport, setViewport] = useState({
    center: [centerLng, centerLat],
    zoom: 15.5,
  });

  const center =
    centerLng != null && centerLat != null ? [centerLng, centerLat] : null;

  const geofenceCircle = center
    ? circle(center, radius / 1000, { steps: 64, units: "kilometers" })
    : null;

  return (
    <div className="flex flex-col border border-[#b8b8b8] min-w-[480px] rounded-[15px]">
      <div className="px-2 py-2">
        <div className="flex flex-row justify-between items-center">
          <p className="text-[16px] text-[#3A3A3A] font-bold">{name}</p>
          <button
            // onClick={test}
            type="button"
            className="w-20 bg-[#2AAF56] hover:bg-[#EC6668] rounded-full text-white "
          >
            View
          </button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-[#b8b8b8] my-0.5 mx-0 px-0 " />

      <div className="relative h-[350px] w-full overflow-hidden rounded-b-[15px]">
        <Map
          viewport={viewport}
          onViewportChange={setViewport}
          ref={mapRef}
          center={[centerLng, centerLat]}
          zoom={viewport.zoom}
          styles={{
            light: "https://tiles.openfreemap.org/styles/positron",
            dark: "https://tiles.openfreemap.org/styles/positron",
          }}
          interactive={false}
        >
          {center && (
            <>
              <MapMarker longitude={center[0]} latitude={center[1]} />
              <MapGeoJSON
                data={geofenceCircle}
                fillPaint={{ "fill-color": "#6675EC", "fill-opacity": 0.2 }}
                linePaint={{ "line-color": "#6675EC", "line-width": 2 }}
              />
            </>
          )}
        </Map>

        <div className="bg-background/80 absolute top-2 right-10 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded border px-2 py-1.5 font-mono text-xs backdrop-blur select-none">
          <span>
            <span className="text-muted-foreground">lng:</span> {centerLng}
          </span>
          <span>
            <span className="text-muted-foreground">lat:</span> {centerLng}
          </span>
          <span>
            <span className="text-muted-foreground">Radius:</span> {radius}
          </span>
        </div>
      </div>
    </div>
  );
}
