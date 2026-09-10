import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "@/components/error-page";

import Login from "@/Page/LoginPage/LoginPageMain";

import DashboardModule from "@/Module/DashboardMain";

import AllEmployee from "@/Module/AllEmployeeMain";
import LeaveRequest from "@/Module/LeaveRequestMain";
import NewEmployee from "@/Module/NewEmployee";

import Attendance from "@/Module/AttendanceMain";

import Location from "@/Module/LocationMain";

import Payroll from "@/Module/PayrollMain";

import DashboardOutlet from "@/Outlet/DashboardOutlet";

import AllEmployeeOutlet from "@/outlet/AllEmployeeOutlet";
import AttendanceOutlet from "@/Outlet/AttendanceOutlet";

import NewEmployeeOutlet from "@/outlet/NewEmployeeOutlet";
import LocationOutlet from "@/Outlet/LocationOutlet";

import PayrollOutlet from "@/outlet/PayrollOutlet";
import RunPayrollOutlet from "@/outlet/RunPayrollOutlet";
import PayslipsOutlet from "@/outlet/PayslipsOutlet";
import PayrollSettingsOutlet from "@/outlet/PayrollSettingsOutlet";
import LoansOutlet from "@/outlet/LoansOutlet";

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
    element: <DashboardModule />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardOutlet />,
      },
    ],
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
        children: [
          {
            index: true,
            element: <NewEmployeeOutlet />,
          },
        ],
      },
      {
        index: true,
        element: <AllEmployeeOutlet />,
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
        children: [
          {
            index: true,
            element: <LocationOutlet />,
          },
        ],
      },
      {
        index: true,
        element: <AttendanceOutlet />,
      },
    ],
  },

  {
    path: "payroll",
    element: <Payroll />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "run",
        element: <RunPayrollOutlet />,
        errorElement: <ErrorPage />,
      },
      {
        path: "payslips",
        element: <PayslipsOutlet />,
        errorElement: <ErrorPage />,
      },
      {
        path: "settings",
        element: <PayrollSettingsOutlet />,
        errorElement: <ErrorPage />,
      },
      {
        path: "loans",
        element: <LoansOutlet />,
        errorElement: <ErrorPage />,
      },
      {
        index: true,
        element: <PayrollOutlet />,
      },
    ],
  },

  {
    index: true,
    element: <Navigate to={"login"} replace />,
  },
  //   ],
  // },
]);
