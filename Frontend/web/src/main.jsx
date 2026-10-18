import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./index.css";

import { router } from "./resources/routes.jsx";
import axios from "axios";
import { installFitScreen } from "./lib/fitScreen";
import DialogHost from "./components/DialogHost.jsx";

// scale the page down on laptop-size screens so every screen shows the same layout
installFitScreen();

// the login is an HttpOnly cookie the server sets: the browser sends it with every request, JavaScript
// never sees it. X-Requested-With is the proof that the request comes from this page (CSRF check).
axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    <DialogHost />
  </React.StrictMode>,
);
