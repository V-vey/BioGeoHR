import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard.jsx";
import AllEmployees from "../pages/AllEmployees.jsx";
import EmployeeProfile from "../pages/EmployeeProfile.jsx";
import Attendance from "../pages/Attendance.jsx";

/**
 * Routes for each page that used to be its own HTML file:
 *   dashboard.html   -> "/"
 *   allEmp.html      -> "/employees"
 *   empProfile.html  -> "/employees/:id"
 *   attendance.html  -> "/attendance"
 */
export default function Homepage() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<AllEmployees />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </BrowserRouter>
  );
}
