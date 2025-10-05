import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- Backend URL ---
const BACKEND_URL = "https://luctreportssystem-1a43-git-main-karabotlalis-projects.vercel.app";

const PrincipalLectureDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Courses");
  const [reports, setReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [error, setError] = useState("");

  const principalName = localStorage.getItem("principal_name") || "Principal";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // --- Fetch Reports ---
  useEffect(() => {
    const fetchReports = async () => {
      if (activeTab !== "Reports") return;
      setLoadingReports(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/lecturer_reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load reports");
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, [activeTab]);

  // --- Fetch Courses ---
  useEffect(() => {
    const fetchCourses = async () => {
      if (activeTab !== "Courses") return;
      setLoadingCourses(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/lecturer_reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        const uniqueCourses = Array.from(
          new Map(data.map(item => [`${item.lecturer_name}-${item.course_name}`, item])).values()
        );
        setCourses(uniqueCourses);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [activeTab]);

  // --- Fetch Classes ---
  useEffect(() => {
    const fetchClasses = async () => {
      if (activeTab !== "Classes") return;
      setLoadingClasses(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/lecturer_reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        const uniqueClasses = Array.from(
          new Map(data.map(item => [item.class_name, item])).values()
        );
        setClasses(uniqueClasses);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load classes");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [activeTab]);

  // --- Fetch Ratings ---
  useEffect(() => {
    const fetchRatings = async () => {
      if (activeTab !== "Rating") return;
      setLoadingRatings(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/student_ratings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch ratings");
        const data = await res.json();
        setRatings(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load ratings");
      } finally {
        setLoadingRatings(false);
      }
    };
    fetchRatings();
  }, [activeTab]);

  // --- Report Row Component (with feedback) ---
  const ReportRow = ({ report }) => {
    const [feedback, setFeedback] = useState(report.feedback || "");
    const [saving, setSaving] = useState(false);

    const handleSaveFeedback = async () => {
      setSaving(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/lecturer_feedback/${report.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feedback, principal_name: principalName }),
        });
        if (!res.ok) throw new Error("Failed to save feedback");
        alert("Feedback saved successfully!");
      } catch (err) {
        console.error(err);
        alert(err.message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <tr>
        <td>{report.lecturer_name}</td>
        <td>{report.course_name}</td>
        <td>{report.class_name}</td>
        <td>{report.week_of_reporting}</td>
        <td>{report.topic_taught}</td>
        <td>{report.learning_outcomes}</td>
        <td>{report.recommendations}</td>
        <td>{new Date(report.created_at).toLocaleDateString()}</td>
        <td>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            style={{ width: "200px" }}
          />
          <button onClick={handleSaveFeedback} disabled={saving} style={{ marginLeft: "5px" }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </td>
      </tr>
    );
  };

  // --- Render Content ---
  const renderContent = () => {
    switch (activeTab) {
      case "Courses":
        return (
          <div>
            <h2>📚 Courses</h2>
            {loadingCourses && <p>Loading courses...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loadingCourses && !error && (
              <table className="table table-dark table-striped">
                <thead><tr><th>Lecturer</th><th>Course</th></tr></thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr><td colSpan="2">No courses found</td></tr>
                  ) : courses.map((c, idx) => (
                    <tr key={idx}><td>{c.lecturer_name}</td><td>{c.course_name}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      case "Reports":
        return (
          <div>
            <h2>📝 Reports</h2>
            {loadingReports && <p>Loading reports...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loadingReports && !error && (
              <table className="table table-dark table-striped">
                <thead>
                  <tr>
                    <th>Lecturer</th><th>Course</th><th>Class</th><th>Week</th>
                    <th>Topic</th><th>Learning Outcomes</th><th>Recommendations</th><th>Date</th><th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan="9">No reports found</td></tr>
                  ) : reports.map((r) => <ReportRow key={r.id} report={r} />)}
                </tbody>
              </table>
            )}
          </div>
        );
      case "Monitoring":
        return <div><h2>📊 Monitoring</h2></div>;
      case "Rating":
        return (
          <div>
            <h2>⭐ Lecturers Ratings</h2>
            {loadingRatings && <p>Loading ratings...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loadingRatings && !error && (
              <table className="table table-dark table-striped">
                <thead><tr><th>Lecturer</th><th>Student</th><th>Rating</th></tr></thead>
                <tbody>
                  {ratings.length === 0 ? (
                    <tr><td colSpan="3">No ratings yet</td></tr>
                  ) : ratings.map((r) => (
                    <tr key={r.id}>
                      <td>{r.lecturer_name}</td>
                      <td>{r.student_name}</td>
                      <td>{"⭐".repeat(r.rating)} ({r.rating}/5)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      case "Classes":
        return (
          <div>
            <h2>🏫 Classes</h2>
            {loadingClasses && <p>Loading classes...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!loadingClasses && !error && (
              <table className="table table-dark table-striped">
                <thead><tr><th>Class Name</th></tr></thead>
                <tbody>
                  {classes.length === 0 ? (
                    <tr><td>No classes found</td></tr>
                  ) : classes.map((c, idx) => <tr key={idx}><td>{c.class_name}</td></tr>)}
                </tbody>
              </table>
            )}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        {["Courses","Reports","Monitoring","Rating","Classes"].map(tab => (
          <span
            key={tab}
            style={{ ...styles.navItem, borderBottom: activeTab===tab ? "3px solid #ffb703" : "none" }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Courses" ? "📚 Courses" :
             tab === "Reports" ? "📝 Reports" :
             tab === "Monitoring" ? "📊 Monitoring" :
             tab === "Rating" ? "⭐ Rating" : "🏫 Classes"}
          </span>
        ))}
        <button onClick={handleLogout} style={styles.logoutButton}>🚪 Logout</button>
      </nav>
      <div style={styles.content}>{renderContent()}</div>
    </div>
  );
};

const styles = {
  container: { backgroundColor:"#121212", minHeight:"100vh", padding:"30px", color:"#fff", fontFamily:"Segoe UI, Arial, sans-serif" },
  navbar: { display:"flex", justifyContent:"center", gap:"20px", backgroundColor:"#1f1f1f", padding:"15px", borderRadius:"8px", marginBottom:"30px", alignItems:"center", flexWrap:"wrap" },
  navItem: { cursor:"pointer", fontWeight:"600", color:"#ffb703", padding:"5px 10px", transition:"all 0.2s" },
  logoutButton: { marginLeft:"20px", padding:"6px 12px", backgroundColor:"#ff0000", color:"#fff", border:"none", borderRadius:"6px", cursor:"pointer", fontWeight:"600" },
  content: { maxWidth:"1000px", margin:"0 auto", backgroundColor:"#1f1f1f", borderRadius:"12px", padding:"20px", boxShadow:"0px 6px 18px rgba(255,255,255,0.1)", overflowX:"auto" },
};

export default PrincipalLectureDashboard;

