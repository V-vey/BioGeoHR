import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

import "./login.css";
import Logo from "../../assets/Logo/Logo";

// 1. FIXED: Removed the broken empty import string from line 7

function LoginPageMain() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // 2. ADDED: Stops the browser from refreshing the page on submit

    // 3. FIXED: Changed target to '/home' to match our combined App.jsx routing setup
    navigate("/dashboard");
    console.log("Logged in successfully!");
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
