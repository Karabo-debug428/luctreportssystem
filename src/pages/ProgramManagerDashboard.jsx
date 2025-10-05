import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://luctreportssystem-1a43-git-main-karabotlalis-projects.vercel.app";

const ProgramManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Courses");
  const [reports, setReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [assignedLecturer, setAssignedLecturer] = useState("");
  const [assignedCourse, setAssignedCourse] = useState("");
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const managerName = localStorage.getItem("manager_name") || "Program Manager";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // --- Fetch Reports
  useEffect(() => {
    if (activeTab !== "Reports") return;
    const fetchReports = async () => {
      setLoadingReports(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/lecturer_reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  // --- Fetch Courses & Lecturers
  useEffect(() => {
    if (activeTab !== "Courses" && activeTab !== "Lectures") return;
    const fetchCourses = async () => {
      setLoadingCourses(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/lecturer_reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const uniqueCourses = Array.from(
          new Map(data.map(item => [`${item.lecturer_name}-${item.course_name}`, item])).values()
        );
        setCourses(uniqueCourses);

        if (activeTab === "Lectures") {
          const uniqueLecturers = Array.from(new Set(data.map(r => r.lecturer_name)));
          setLecturers(uniqueLecturers);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [activeTab]);

  // --- Fetch Classes
  useEffect(() => {
    if (activeTab !== "Classes") return;
    const fetchClasses = async () => {
      setLoadingClasses(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/lecturer_reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  // --- Fetch Ratings
  useEffect(() => {
    if (activeTab !== "Rating") return;
    const fetchRatings = async () => {
      setLoadingRatings(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/student_ratings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  // --- Report Row with Feedback
  const ReportRow = ({ report }) => {
    const [feedback, setFeedback] = useState(report.feedback?.[0]?.feedback || "");
    const [saving, setSaving] = useState(false);

    const handleSaveFeedback = async () => {
      if (!feedback) return alert("Feedback cannot be empty");
      setSaving(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/lecturer_feedback/${report.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ feedback, principal_name: managerName })
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
          <button
            onClick={handleSaveFeedback}
            disabled={saving}
            style={{ marginLeft: "5px" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </td>
      </tr>
    );
  };

  // --- Assign Course to Lecturer
  const handleAssignCourse = async () => {
    if (!assignedLecturer || !assignedCourse) {
      setMessage("Select both lecturer and course");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/assign_course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lecturer_name: assignedLecturer,
          course_name: assignedCourse,
          assigned_by: managerName
        })
      });
      if (!res.ok) throw new Error("Failed to assign course");
      setMessage(`Course ${assignedCourse} assigned to ${assignedLecturer}`);
      setAssignedLecturer("");
      setAssignedCourse("");
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    }
  };

  // --- Render Tab Content
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
                    <th>Topic</th><th>Learning Outcomes</th><th>Recommendations</th>
                    <th>Date</th><th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr><td colSpan="9">No reports found</td></tr>
                  ) : reports.map(r => <ReportRow key={r.id} report={r} />)}
                </tbody>
              </table>
            )}
          </div>
        );
      case "Lectures":
        return (
          <div>
            <h2>👨‍🏫 Lecturers</h2>
            {message && <p style={{ color: "lightgreen" }}>{message}</p>}
            <div style={{ marginBottom: "20px" }}>
              <select
                value={assignedLecturer}
                onChange={(e) => setAssignedLecturer(e.target.value)}
                style={{ marginRight: "10px" }}
              >
                <option value="">Select Lecturer</option>
                {lecturers.map((l, idx) => <option key={idx} value={l}>{l}</option>)}
              </select>

              <select
                value={assignedCourse}
                onChange={(e) => setAssignedCourse(e.target.value)}
                style={{ marginRight: "10px" }}
              >
                <option value="">Select Course</option>
                {courses.map((c, idx) => (
                  <option key={idx} value={c.course_name}>{c.course_name}</option>
                ))}
              </select>

              <button onClick={handleAssignCourse}>Assign Course</button>
            </div>
            <h3>Lecturers List</h3>
            <ul>
              {lecturers.map((l, idx) => <li key={idx}>{l}</li>)}
            </ul>
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
                  ) : ratings.map(r => (
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
        {["Courses","Reports","Lectures","Monitoring","Rating","Classes"].map(tab => (
          <span
            key={tab}
            style={{ ...styles.navItem, borderBottom: activeTab===tab ? "3px solid #ffb703" : "none" }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "Courses" ? "📚 Courses" :
             tab === "Reports" ? "📝 Reports" :
             tab === "Lectures" ? "👨‍🏫 Lecturers" :
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

export default ProgramManagerDashboard;
