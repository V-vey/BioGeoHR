import React, { Component } from "react";

class LoginPageMain extends Component {
  constructor(props) {
    super(props);
  }
  state = {};
  render() {
    return (
      <>
        <h2>BioGeoHR</h2>
        <form>
          <input
            type="email"
            name="email"
            id="email"
            label="Enter Your Email"
          />
          <br />
          <input
            type="password"
            name="password"
            id="password"
            label="Enter Your Password"
          />
          <input type="submit" />
        </form>
      </>
    );
  }
}

// Fixed: Removed the () from the export statement
export default LoginPageMain;
