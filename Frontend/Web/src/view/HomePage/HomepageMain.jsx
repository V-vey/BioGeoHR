import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

import "./login.css";
import Logo from "../../assets/Logo/Logo";
function HomepageMain() {
  return (
    <>
      <div className="login-container">
        <Logo />
      </div>
    </>
  );
}

// Fixed: Removed the () from the export statement
export default HomepageMain;
