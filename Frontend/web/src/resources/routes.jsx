import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/components/error-page";

import Login from "@/Page/LoginPage/LoginPageMain";

import Dashboard from "@/Page/Dashboard/DashboardMain";

import AllEmployee from "@/Page/Employee/AllEmployee/AllEmployeeMain";
import LeaveRequest from "@/Page/Employee/LeaveRequest/LeaveRequestMain";
import NewEmployee from "@/Page/Employee/NewEmployee/NewEmployee";

import Attendance from "@/Page/Attendance/AttendanceMain/AttendanceMain";
import Location from "@/Page/Attendance/Location/LocationMain";

import Payroll from "@/Page/Payroll/PayrollMain";
export const router = createBrowserRouter([
  {
    // path to where it should go
    // path: "/",
    // element: <PublicModule />,
    // errorElement: <ErrorPage />,
    // children: [
    //   {
    path: "login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "dashboard",
    element: <Dashboard />,
    errorElement: <ErrorPage />,
  },
  {
    path: "employee",
    element: <AllEmployee />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "leave-request",
        element: <LeaveRequest />,
        errorElement: <ErrorPage />,
      },
      {
        path: "new-employee",
        element: <NewEmployee />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: "attendance",
    element: <Attendance />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "location",
        element: <Location />,
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: "payroll",
    element: <Payroll />,
    errorElement: <ErrorPage />,
  },

  {
    index: true,
    element: <Navigate to={"login"} replace />,
  },
  //   ],
  // },
]);
