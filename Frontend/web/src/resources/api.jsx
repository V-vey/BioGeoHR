import React from "react";
import axios from "axios";

// The address of the API (the same host as Frontend/Mobile/lib/Service/Url.dart).
// While developing (npm run dev) the website calls "/api" on its OWN address and Vite forwards it to
// the real API (see vite.config.js). The login cookie then belongs to the website itself, so the browser
// never has to accept a third-party cookie, and the login cannot loop back to the login page because
// of cookie blocking. A built site (npm run build) calls the API directly.


// export const API_ORIGIN = "https://froth-limes-skid.ngrok-free.dev";
export const API_ORIGIN = "http://localhost:8000";

export const url = import.meta.env.DEV ? "/api" : `${API_ORIGIN}/api`;
