import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../App.css";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.role) return;

      const roleLower = user.role.replace(/\s+/g, "").toLowerCase();

      if (roleLower === "student") navigate("/student", { replace: true });
      else if (roleLower === "principallecture") navigate("/principal-lecturer", { replace: true });
      else if (roleLower === "programleader") navigate("/program-manager", { replace: true });
      else if (roleLower === "lecturer") navigate("/lecturer", { replace: true });
    } catch {
      console.warn("No valid user in localStorage");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (!isLogin) data.role = role;

    try {
      const url = isLogin
        ? "http://localhost:5000/login"
        : "http://localhost:5000/register";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      setLoading(false);

      if (!res.ok) {
        setMessage(result.message || "An error occurred.");
        return;
      }

      const roleLower = result.user.role.replace(/\s+/g, "").toLowerCase();
      const userWithLowerRole = { ...result.user, role: roleLower };

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(userWithLowerRole));

      // Show success message briefly
      setMessage(isLogin ? "Login successful!" : "Registration successful!");

      // Redirect immediately after a short delay
      setTimeout(() => {
        if (roleLower === "student") navigate("/student", { replace: true });
        else if (roleLower === "principallecture") navigate("/principal-lecturer", { replace: true });
        else if (roleLower === "programleader") navigate("/program-manager", { replace: true });
        else if (roleLower === "lecturer") navigate("/lecturer", { replace: true });
        else setMessage("Unknown role, cannot redirect.");
      }, 800);

    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("An error occurred. Check console.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLogin(true);
    setRole("");
    setMessage("");
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="system-heading mb-4">Limkokwing System Report</h1>

      <div className="card p-4 shadow" style={{ minWidth: "400px", maxWidth: "500px", width: "100%" }}>
        <h3 className="text-center mb-4">{isLogin ? "Login" : "Register"}</h3>

        {message && (
          <div className="alert alert-info text-center" role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              className="form-control mb-3"
              placeholder="Full Name"
              required
            />
          )}
          <input
            type="email"
            name="email"
            className="form-control mb-3"
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            className="form-control mb-3"
            placeholder="Password"
            required
          />

          {!isLogin && (
            <select
              className="form-select mb-3"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="principallecture">Principal Lecture</option>
              <option value="programleader">Program Leader</option>
            </select>
          )}

          <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mb-2">
          <span style={{ color: '#f5f5f5' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          </span>
          <span
            style={{ cursor: "pointer", color: "#28a745", fontWeight: 'bold' }}
            onClick={() => {
              setIsLogin(!isLogin);
              setRole("");
              setMessage("");
            }}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>

        {!isLogin && (
          <button onClick={handleLogout} className="btn btn-danger w-100">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthPage;









