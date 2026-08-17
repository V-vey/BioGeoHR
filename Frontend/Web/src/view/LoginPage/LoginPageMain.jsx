import React, { Component } from "react";
import "./login.css";
import Logo from "../../assets/Logo/Logo";
class LoginPageMain extends Component {
  constructor(props) {
    super(props);
  }
  state = {};
  render() {
    return (
      <>
        <div className="login-container">
          <Logo />
          <form>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter Your Email"
            />
            <br />
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter Your Password"
            />
            <br />
            <input type="submit" value="Log-in" />
          </form>
        </div>
      </>
    );
  }
}

// Fixed: Removed the () from the export statement
export default LoginPageMain;
