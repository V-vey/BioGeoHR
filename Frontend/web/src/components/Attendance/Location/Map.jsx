import { useEffect, useRef, useState } from "react";
import { Map, MapControls } from "@/components/ui/map";

// Ensure MapLibre styles are loaded
import "maplibre-gl/dist/maplibre-gl.css";

const styles = {
  default: undefined,
  openstreetmap: "https://tiles.openfreemap.org/styles/bright",
  openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
  bright: "https://tiles.openfreemap.org/styles/bright",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  positron: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
  fiord: "https://tiles.openfreemap.org/styles/fiord",
};

export default function ControlledMapExample({
  centerLng,
  centerLat,
  zoom,
  viewport,
  setViewport,
}) {
  // Corrected the inverted naming convention to avoid state glitches

  // MapLibre uses a structural [lng, lat] coordinate array format
  // const [viewport, setViewport] = useState({
  //   center: [centerLng, centerLat],
  //   zoom: zoom,
  // });

  const mapRef = useRef(null);
  const [style, setStyle] = useState("default");
  const selectedStyle = styles[style];
  const is3D = style === "openstreetmap3d";

  useEffect(() => {
    mapRef.current?.easeTo({ pitch: is3D ? 60 : 0, duration: 500 });
  }, [is3D]);

  return (
    // Fixed Tailwind arbitrary bracket height syntax from h-500px to h-[500px]
    <div className="relative h-[500px] w-full border rounded-lg overflow-hidden">
      <Map
        viewport={viewport}
        onViewportChange={setViewport}
        ref={mapRef}
        center={[centerLng, centerLat]}
        zoom={zoom}
        styles={
          selectedStyle
            ? { light: selectedStyle, dark: selectedStyle }
            : undefined
        }
      >
        <MapControls
          position="top-right"
          showZoom
          showCompass
          showLocate
          showFullscreen
        />
      </Map>

      {/* Coordinates Status Badge */}
      {/* <div className="bg-background/80 absolute top-2 right-10 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded border px-2 py-1.5 font-mono text-xs backdrop-blur select-none">
        <span>
          <span className="text-muted-foreground">lng:</span>{" "}
          {viewport.center[0]?.toFixed(8)}
        </span>
        <span>
          <span className="text-muted-foreground">lat:</span>{" "}
          {viewport.center[1]?.toFixed(8)}
        </span>
        <span>
          <span className="text-muted-foreground">zoom:</span>{" "}
          {viewport.zoom?.toFixed(1)}
        </span>
      </div> */}

      {/* Style Dropdown Selector */}
      <div className="absolute top-2 left-2 z-10">
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="bg-background text-foreground rounded-md border px-2 py-1 text-sm shadow outline-none"
        >
          <option value="default">Default (Carto)</option>
          <option value="openstreetmap">OpenStreetMap</option>
          <option value="openstreetmap3d">OpenStreetMap 3D</option>
          <option value="bright">Bright</option>
          <option value="liberty">Liberty</option>
          <option value="positron">Positron</option>
          <option value="dark">Dark</option>
          <option value="fiord">Fiord</option>
        </select>
      </div>
    </div>
  );
}
