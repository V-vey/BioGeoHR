// import { createRoot } from "react-dom/client";
// import { AppProvider } from "./context/AppContext";

// import ReactDOM from "react-dom/client";
// import {
//   createBrowserRouter,
//   Navigate,
//   RouterProvider,
// } from "react-router-dom";
// import "./index.css";
// //Pages
// import LoginPageMain from "./view/LoginPage/LoginPageMain";

// //error Page
// import ErrorComponent from "./view/components/ErrorComponent";
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <LoginPageMain />,
//     errorElement: <ErrorComponent />,
//   },
// ]);
// ReactDOM.createRoot(document.getElementById("root")).render(
//   <AppProvider>
//     <RouterProvider router={router} />,
//   </AppProvider>,
// );

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // Imports the App file with your routes
import "./index.css"; // (Optional) Your global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
