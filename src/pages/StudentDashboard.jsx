import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Classes");
  const [classes, setClasses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const studentName = localStorage.getItem("student_name") || "Student";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Fetch Classes
  useEffect(() => {
    if (activeTab !== "Classes") return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/classes", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => setError("Failed to load classes"))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // Fetch Lecturers
  useEffect(() => {
    if (activeTab !== "Lecturers") return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/lecturer_reports", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const uniqueLecturers = Array.from(
          new Map(data.map(item => [item.lecturer_name, item])).values()
        );
        setLecturers(uniqueLecturers);
      })
      .catch(err => setError("Failed to load lecturers"))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // Fetch Ratings Submitted by Student
  useEffect(() => {
    if (activeTab !== "MyRatings") return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/student_my_ratings", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRatings(data))
      .catch(err => setError("Failed to load your ratings"))
      .finally(() => setLoading(false));
  }, [activeTab]);

  // Handle Rating Submit
  const handleRateLecturer = async () => {
    if (!selectedLecturer || ratingValue === 0) {
      alert("Please select a lecturer and rating!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/student_ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ratings: [
            { student_name: studentName, lecturer_name: selectedLecturer, rating: ratingValue }
          ]
        })
      });
      if (!res.ok) throw new Error("Failed to submit rating");
      alert("Rating submitted successfully!");
      setSelectedLecturer("");
      setRatingValue(0);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Classes":
        return (
          <div>
            <h2>🏫 My Classes</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul>
              {classes.map((c, idx) => (
                <li key={idx}>{c.class_name} - {c.course_name}</li>
              ))}
            </ul>
          </div>
        );
      case "Lecturers":
        return (
          <div>
            <h2>👩‍🏫 Lecturers</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul>
              {lecturers.map((l, idx) => (
                <li key={idx}>{l.lecturer_name} ({l.course_name})</li>
              ))}
            </ul>
          </div>
        );
      case "RateLecturer":
        return (
          <div>
            <h2>⭐ Rate a Lecturer</h2>
            <select value={selectedLecturer} onChange={e => setSelectedLecturer(e.target.value)}>
              <option value="">-- Select Lecturer --</option>
              {lecturers.map((l, idx) => (
                <option key={idx} value={l.lecturer_name}>{l.lecturer_name}</option>
              ))}
            </select>
            <br />
            <label>
              Rating:
              <input
                type="number"
                min="1"
                max="5"
                value={ratingValue}
                onChange={e => setRatingValue(Number(e.target.value))}
              />
            </label>
            <button onClick={handleRateLecturer}>Submit</button>
          </div>
        );
      case "MyRatings":
        return (
          <div>
            <h2>📊 My Ratings</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul>
              {ratings.map((r, idx) => (
                <li key={idx}>
                  {r.lecturer_name} - {r.rating}⭐
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        {["Classes", "Lecturers", "RateLecturer", "MyRatings"].map(tab => (
          <span
            key={tab}
            style={{ ...styles.navItem, borderBottom: activeTab === tab ? "3px solid #ffb703" : "none" }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Classes" ? "🏫 Classes" :
             tab === "Lecturers" ? "👩‍🏫 Lecturers" :
             tab === "RateLecturer" ? "⭐ Rate Lecturer" :
             "📊 My Ratings"}
          </span>
        ))}
        <button onClick={handleLogout} style={styles.logoutButton}>🚪 Logout</button>
      </nav>
      <div style={styles.content}>{renderContent()}</div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#121212",
    minHeight: "100vh",
    padding: "30px",
    color: "#fff",
    fontFamily: "Segoe UI, Arial, sans-serif"
  },
  navbar: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    backgroundColor: "#1f1f1f",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "30px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  navItem: {
    cursor: "pointer",
    fontWeight: "600",
    color: "#ffb703",
    padding: "5px 10px",
    transition: "all 0.2s"
  },
  logoutButton: {
    marginLeft: "20px",
    padding: "6px 12px",
    backgroundColor: "#ff0000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#1f1f1f",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0px 6px 18px rgba(255,255,255,0.1)",
    overflowX: "auto"
  }
};

export default StudentDashboard;

