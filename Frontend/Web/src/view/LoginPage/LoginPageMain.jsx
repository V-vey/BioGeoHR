import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

import "./login.css";
import Logo from "../../assets/Logo/Logo";
function LoginPageMain() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  //when press do
  const handleSubmit = async (e) => {
    console.log("Fuck of");
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
            value={email} // Fixed: Controlled input value
            onChange={(e) => setEmail(e.target.value)} // Fixed: Tracks changes
          />
          <br />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter Your Password"
            value={password} // Fixed: Controlled input value
            onChange={(e) => setPassword(e.target.value)} // Fixed: Tracks changes
          />
          <br />
          <input type="Submit" value="Log-in" />
        </form>
      </div>
    </>
  );
}

// Fixed: Removed the () from the export statement
export default LoginPageMain;
