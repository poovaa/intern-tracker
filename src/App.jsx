import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import WorkStatus from "./pages/WorkStatus";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import MentorMeetings from "./pages/mentor/MentorMeetings";
import MentorInterns from "./pages/mentor/MentorInterns";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorAttendanceQR from "./pages/mentor/MentorAttendanceQR";
import MentorAttendanceReport from "./pages/mentor/MentorAttendanceReport";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/work-status" element={<WorkStatus />} />
        <Route path="/profile" element={<Profile />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mentor/dashboard"element={<MentorDashboard />}/>
        <Route path="/mentor/meetings" element={<MentorMeetings />}/>
       <Route path="/mentor/interns" element={<MentorInterns />}/>
       <Route path="/mentor/attendance-qr" element={<MentorAttendanceQR />}/>
       <Route path="/mentor/attendance/report" element={<MentorAttendanceReport />}/>
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;