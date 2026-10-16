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
  // Being Posted
  const loginForm = {
    email: email,
    password: password,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
          localStorage.setItem("token", response.data.token); //cookie

          // mark employees with no record on past working days as absent;
          // a failure here must not block the login
          try {
            await axios.post(
              url + "/attendance/sync-absences",
              {},
              {
                headers: {
                  Authorization: `Bearer ${response.data.token}`,
                  "ngrok-skip-browser-warning": "true",
                },
              },
            );
          } catch (syncError) {
            console.error("Absence sync failed:", syncError);
          }
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
        notifyError(
          "User not found. Please check your email.",
          "Could not log in",
        );
      } else if (error.response?.status === 301) {
        notifyError(
          "Password is incorrect. Please try again.",
          "Could not log in",
        );
      } else {
        console.error("Error during login:", error);
      }
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
