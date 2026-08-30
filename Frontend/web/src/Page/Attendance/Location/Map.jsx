import { useEffect, useRef, useState } from "react";
import { Map } from "@/components/ui/map";

const styles = {
  default: undefined,
  openstreetmap: "https://tiles.openfreemap.org/styles/bright",
  openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

export default function ControlledMapExample() {
  //location center
  let centerLat = 124.66181861;
  let centerLong = 13.26533063;

  let zoom = 4.0;

  const [viewport, setViewport] = useState({
    center: [centerLat, centerLong],
    zoom: zoom,
  });

  //style map
  const mapRef = useRef(null);
  const [style, setStyle] = useState("default");
  const selectedStyle = styles[style];
  const is3D = style === "openstreetmap3d";

  useEffect(() => {
    mapRef.current?.easeTo({ pitch: is3D ? 60 : 0, duration: 500 });
  }, [is3D]);

  return (
    <div className="relative h-[500px] w-full">
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
        ref={mapRef}
        //style
        center={[centerLat, centerLong]}
        zoom={zoom}
        styles={
          selectedStyle
            ? { light: selectedStyle, dark: selectedStyle }
            : undefined
        }
      />
      <div className="bg-background/80 absolute top-2 left-2 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded border px-2 py-1.5 font-mono text-xs backdrop-blur">
        <span>
          <span className="text-muted-foreground">lng:</span>{" "}
          {viewport.center[0].toFixed(8)}
        </span>
        <span>
          <span className="text-muted-foreground">lat:</span>{" "}
          {viewport.center[1].toFixed(8)}
        </span>
        <span>
          <span className="text-muted-foreground">zoom:</span>{" "}
          {viewport.zoom.toFixed(1)}
        </span>
      </div>
      {/* //style */}
      <div className="absolute top-2 right-2 z-10">
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="bg-background text-foreground rounded-md border px-2 py-1 text-sm shadow"
        >
          <option value="default">Default (Carto)</option>
          <option value="openstreetmap">OpenStreetMap</option>
          <option value="openstreetmap3d">OpenStreetMap 3D</option>
        </select>
      </div>
    </div>
  );
}
