import axios from "axios";
import { url } from "@/resources/api";
import { useState, useEffect } from "react";
import circle from "@turf/circle";
import Maps from "@/components/Attendance/Location/Map";
import MapControllers from "@/components/Attendance/Location/map-controller";

export default function LocationModal({
  onClose,
  name,
  centerLng,
  centerLat,
  radius,
  id,
  refresh,
}) {
  let zoom = 15.5;

  const [center, setCenter] = useState(
    centerLng != null && centerLat != null ? [centerLng, centerLat] : null,
  );
  const [radiusM, setRadiusM] = useState(radius);

  const geofenceCircle = center
    ? circle(center, radiusM / 1000, { steps: 64, units: "kilometers" })
    : null;

  const [viewport, setViewport] = useState({
    center: [centerLng, centerLat],
    zoom: zoom,
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="flex flex-col gap-2 bg-[#f2f2f2] rounded-xl p-6 min-w-[70%] max-w-[60%] max-h-[80%] ">
        <div className="flex flex-row justify-between bg-white items-center px-4 py-3 rounded-[10px] border border-[#b2b2b2]">
          <button
            onClick={onClose}
            className="text-white bg-[#2AAF56] text-[20px] items-center rounded-[10px]  px-4 py-1 hover:bg-[#6675EC]"
          >
            ← Back
          </button>
          <h2 className="font-bold">Location</h2>
        </div>

        <div className="flex flex-row  justify-end mb-4 p-4 md:p-[16px_20px] bg-white rounded-[10px] border border-[#b2b2b2] gap-4">
          <div className="flex-2">
            <Maps
              centerLat={centerLat}
              centerLng={centerLng}
              zoom={zoom}
              viewport={viewport}
              setViewport={setViewport}
              geofenceCircle={geofenceCircle}
              setCenter={setCenter}
              center={center}
              radius={radiusM}
            />
            {/* <TestMap radiusMeters={100} /> */}
          </div>
          <div className="flex-1">
            <MapControllers
              nameM={name}
              centerLat={center?.[1]?.toFixed(8)}
              centerLng={center?.[0]?.toFixed(8)}
              setRadius={setRadiusM}
              radius={radiusM}
              modal={true}
              id={id}
              refresh={refresh}
              onClose={onClose}
            />
          </div>
        </div>

        <div></div>
      </div>
    </div>
  );
}
