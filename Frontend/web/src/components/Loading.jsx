import React from "react";

export default function Loading() {
  return (
    <div className="z-50 absolute left-0 top-0 w-screen h-screen bg-black bg-opacity-30 flex justify-center items-center">
      <div className=" animate-spin absolute w-28 h-28 border-r-4 border-trc rounded-full"></div>
      <div className=" animate-reverse-spin absolute w-28 h-28 border-r-4 border-src rounded-full"></div>

      <div className=" animate-spin absolute w-16 h-16 border-r-4 border-trc rounded-xl"></div>
      <div className=" animate-spin absolute w-16 h-16 border-l-4 border-src rounded-xl"></div>
      <div className=" animate-reverse-spin absolute w-16 h-16 border-t-4 border-trc rounded-xl"></div>
      <div className=" animate-reverse-spin absolute w-16 h-16 border-b-4 border-src rounded-xl"></div>

      <div className=" animate-spin absolute w-10 h-10 border-r-4 border-trc rounded-full"></div>
      <div className=" animate-spin absolute w-10 h-10 border-l-4 border-src rounded-full"></div>
      <div className=" animate-reverse-spin absolute w-4 h-4 border-t-8 border-trc rounded-xl"></div>
      <div className=" animate-reverse-spin absolute w-4 h-4 border-b-8 border-src rounded-xl"></div>
    </div>
  );
}
