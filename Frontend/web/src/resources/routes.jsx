import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/components/error-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicModule />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "home",
        element: <HomeOutlet />,
        errorElement: <ErrorPage />,
      },
      {
        path: "service",
        element: <ServiceOutlet />,
        errorElement: <ErrorPage />,
      },
      {
        index: true,
        element: <Navigate to={"home"} replace />,
      },
    ],
  },
]);
