import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

import axios from "axios";
import { url } from "@/resources/api";
import { notifyError } from "@/lib/dialog";
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
  const [loading, setLoading] = useState(false); // true while the login is being checked
  // Being Posted
  const loginForm = {
    email: email,
    password: password,
    platform: "Web", // the audit log says where the login came from
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // already logging in

    setLoading(true);
    try {
      await axios.post(url + "/login", loginForm).then(async (response) => {
        //block the user if they are not HR
        if (response.data.user !== "HR") {
          notifyError(
            "You are not authorized to access this page. Only HR users can log in.",
            "Not allowed",
          );
          return;
        }
        if (response.data.authenticated === "Log in Success") {
          // the login is now in an HttpOnly cookie the server just set: nothing to store here

          // the absences are marked on the dashboard now, so the login does not wait for them
          navigate("/dashboard");
        } else {
          notifyError(
            "Please try again. Something went wrong.",
            "Could not log in",
          );
        }
      });
    } catch (error) {
      if (error.response?.status === 300) {
        notifyError("Invalid credential please try again.", "Could not log in");
      } else if (error.response?.status === 301) {
        notifyError("Invalid credential please try again.", "Could not log in");
      } else {
        console.error("Error during login:", error);
      }
    } finally {
      setLoading(false);
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
          <input
            type="submit"
            value={loading ? "Logging in..." : "Log-in"}
            disabled={loading}
          />
        </form>
      </div>
    </>
  );
}

// 4. FIXED: Removed the "()" parentheses. Export the function itself, don't execute it.
export default LoginPageMain;
