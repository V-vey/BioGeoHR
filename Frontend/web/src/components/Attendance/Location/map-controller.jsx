import axios from "axios";
import { url } from "@/resources/api";
import React, { useState } from "react";

export default function MapController({
  centerLng,
  centerLat,
  setRadius,
  radius,
}) {
  const token = localStorage.getItem("token");
  const [name, setName] = useState("");

  const createLocation = {
    name: name,
    longitude: centerLng,
    latitude: centerLat,
    radius: radius,
  };
  const handleSubmit = async (e) => {
    e.preventDefault;

    try {
      await axios
        .post(url + "/location", createLocation, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          "ngrok-skip-browser-warning": "true",
        })
        .then((response) => {
          if (response.status == 201) {
            alert("New Location Successfuly");
          }
        });
    } catch (e) {
      alert("Something went wrong:", e);
    }
  };
  return (
    <div className="flex justify-end min-h-[500px] p-4 md:p-[16px_20px] bg-white border border-[#B2B2B2] rounded-[14px]">
      <div className="flex-col w-full">
        <h2 className="flex items-start">Create Location</h2>
        <div className="h-2" />

        <div className="h-px w-full m-0 bg-[#B2B2B2] my-0.5 " />

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 my-2">
            <input
              required
              type="text"
              name="locationName"
              id="locationName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Location Name: "
              className="w-full border rounded-[7px] border-[#B2B2B2] px-2 py-2"
            />
            <div className="flex flex-row flex-wrap gap-2 w-full justify-center ">
              <div className="flex flex-1 flex-col border rounded-[7px] border-[#B2B2B2]">
                <p className="flex justify-center font-medium text-[#4C4C4C]">
                  Latitude
                </p>
                <div className=" h-px w-full m-0 bg-[#B2B2B2] my-0.5" />
                <input
                  // type="number"
                  name="latitude"
                  id="latitude"
                  className="text-center"
                  value={centerLat}
                />
              </div>
              <div className="flex flex-1 flex-col border rounded-[7px] border-[#B2B2B2]">
                <p className="flex justify-center font-medium text-[#4C4C4C]">
                  Longitude:
                </p>
                <div className="h-[1px] w-full m-0 bg-[#B2B2B2] my-0.5" />
                <input
                  // type="number"
                  name="longitude"
                  id="longitude"
                  className="text-center"
                  value={centerLng}
                />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 border rounded-[7px] border-[#B2B2B2] p-2">
              <div className="flex justify-between">
                <p>Radius:</p>
                <p>{radius}m</p>
              </div>

              <input
                type="range"
                name="radius"
                id="radius"
                min={100}
                max={200}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="
                    w-full h-1.5 rounded-full 
                
                "
              />
            </div>
            <div className="flex w-full justify-end items-end">
              <input
                type="submit"
                value="Submit"
                className="bg-[#2AAF56] hover:bg-[#6675EC] text-[#FFFFFF] rounded-[10px] px-4 py-1"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
