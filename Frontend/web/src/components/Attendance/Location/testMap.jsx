import { useState, useEffect } from "react";
import { Map, MapGeoJSON, MapMarker, useMap } from "@/components/ui/map";
import circle from "@turf/circle";

// This is a component YOU define here — not part of the map library
function MapClickHandler({ onClick }) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      onClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    };

    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, onClick]);

  return null;
}

export default function GeofenceLocationPicker({ radiusMeters = 100 }) {
  const [center, setCenter] = useState(null);

  const geofenceCircle = center
    ? circle(center, radiusMeters / 1000, { steps: 64, units: "kilometers" })
    : null;

  return (
    <div className="h-[420px] w-full">
      <Map center={[120.596, 15.4802]} zoom={15}>
        <MapClickHandler onClick={({ lng, lat }) => setCenter([lng, lat])} />

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

      {center && (
        <p className="text-sm text-gray-500 mt-2">
          Lat: {center[1].toFixed(6)}, Lng: {center[0].toFixed(6)}
        </p>
      )}
    </div>
  );
}
