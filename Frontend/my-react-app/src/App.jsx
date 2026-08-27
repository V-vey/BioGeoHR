import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPageMain from "./view/LoginPage/LoginPageMain.jsx";
import Homepage from "./view/HomePage/Homepage.jsx";

// //Homepage
import Dashboard from "./view/pages/Dashboard.jsx";
import AllEmployees from "./view/pages/AllEmployees.jsx";
import EmployeeProfile from "./view/pages/EmployeeProfile.jsx";
import Attendance from "./view/pages/Attendance.jsx";
import LeaveRequest from "./view/pages/LeaveRequest.jsx";
import Location from "./view/pages/Location/Location.jsx";
import NewEmployee from "./view/pages/NewEmployee.jsx";
import Payroll from "./view/pages/Payroll.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPageMain />} />

        {/* Navigations */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<AllEmployees />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leaveRequest" element={<LeaveRequest />} />
        <Route path="/location" element={<Location />} />
        <Route path="/newEmployee" element={<NewEmployee />} />
        <Route path="/payroll" element={<Payroll />} />
      </Routes>
    </BrowserRouter>
  );
}

// import { BrowserRouter, Routes, Route } from "react-router-dom";
//

// export default function Homepage() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/employees" element={<AllEmployees />} />
//         <Route path="/employees/:id" element={<EmployeeProfile />} />
//         <Route path="/attendance" element={<Attendance />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
