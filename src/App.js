import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import LecturerDashboard from "./pages/LecturerDashboard";
import PrincipalLectureDashboard from "./pages/PrincipalLectureDashboard"; 
import ProgramManagerDashboard from "./pages/ProgramManagerDashboard";

function App() {
  const getRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}"); // fallback to empty object
      return user?.role?.toLowerCase() || null; // lowercase for consistent checks
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      return null;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Auth Page */}
        <Route path="/" element={<AuthPage />} />

        {/* Student Dashboard */}
        <Route
          path="/student"
          element={getRole() === "student" ? <StudentDashboard /> : <Navigate to="/" />}
        />

        {/* Lecturer Dashboard */}
        <Route
          path="/lecturer"
          element={
            ["lecturer", "programleader"].includes(getRole())
              ? <LecturerDashboard />
              : <Navigate to="/" />
          }
        />

        {/* Principal Lecture Dashboard */}
        <Route
          path="/principal-lecturer"
          element={getRole() === "principallecture" ? <PrincipalLectureDashboard /> : <Navigate to="/" />}
        />
      


      <Route path="/program-manager" element={<ProgramManagerDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

