import React, { Component } from "react";
import "./logo.css";
import { useTestContext } from "@/context/TestContext";

function Logo({ size }) {
  //pass
  size("111");
  const { token, asd } = useTestContext();
  return (
    <>
      <div>
        <span className="bio-geo">BioGeo</span>
        <span className="hr">HR</span>
      </div>
    </>
  );
}

export default Logo;
