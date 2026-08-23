import React from "react";
import { Navigate, NavLink, useRouteError } from "react-router-dom";

export default function ErrorComponent() {
  const error = useRouteError();
  console.error(error);

  if (!error || !error.statusText || !error.message) {
    // This block will handle cases where error is null or the properties are not available
    return (
      <div
        id="error-page"
        className="w-full h-screen text-center content-center"
      >
        <h1 className="text-4xl font-bold mb-10">Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p className="mb-8">
          <i>Something went wrong. Please try again later.</i>
        </p>
        <NavLink
          className={
            " py-2 hover:scale-105 px-4 rounded-xl drop-shadow-md border-y-2 border-prc"
          }
          to={"/"}
          replace={true}
        >
          {"< public page"}
        </NavLink>
      </div>
    );
  } else {
    // If there is an error with statusText or message
    return (
      <div
        id="error-page"
        className="w-full h-screen text-center content-center"
      >
        <h1 className="text-4xl font-bold mb-10">Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error.statusText || error.message}</i>
          <NavLink
            className={
              " py-2 hover:scale-105 px-4 rounded-xl drop-shadow-md border-y-2 border-prc"
            }
            to={"/"}
            replace={true}
          >
            {"< public"}
          </NavLink>
        </p>
      </div>
    );
  }
}
