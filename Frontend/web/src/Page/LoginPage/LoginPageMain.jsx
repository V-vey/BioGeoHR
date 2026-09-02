import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

import axios from "axios";
import { url } from "@/resources/api";
import "./login.css";

// 1. FIXED: Removed the broken empty import string from line 7
function Logo() {
  return (
    <div className="font-bold text-[3rem] m-3">
      <span className="text-[#2aaf56]">BioGeo</span>
      <span className="text-[#6675ec]">HR</span>
    </div>
  );
}

function LoginPageMain() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginForm = {
    email: email,
    password: password,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(url + "/login", loginForm).then((response) => {
        console.log("Success! Created item:", response.data);
      });
    } catch (error) {
      console.error("Error during login:", error);
    }
  };
  //pass
  const test = (text) => {
    console.log(text);
  };

  return (
    <>
      <div className="login-container">
        <Logo />
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <input type="submit" value="Log-in" />
        </form>
      </div>
    </>
  );
}

// 4. FIXED: Removed the "()" parentheses. Export the function itself, don't execute it.
export default LoginPageMain;
