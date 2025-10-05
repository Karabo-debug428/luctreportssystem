import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const lecturerName = localStorage.getItem("lecturer_name");

  const [activeTab, setActiveTab] = useState("classes");
  const [formData, setFormData] = useState({
    faculty_name: "",
    class_name: "",
    week_of_reporting: "",
    lecture_date: "",
    course_name: "",
    course_code: "",
    lecturer_name: lecturerName || "",
    students_present: "",
    total_students: "120",
    venue: "",
    lecture_time: "",
    topic_taught: "",
    learning_outcomes: "",
    recommendations: "",
  });

  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [ratings, setRatings] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentRating, setStudentRating] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // --- Fetch classes
  useEffect(() => {
    if (activeTab === "classes") {
      fetch("http://localhost:5000/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setClasses(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching classes:", err));
    }
  }, [activeTab, token]);

  // --- Fetch courses for filter dropdown
  useEffect(() => {
    if (activeTab === "reports") {
      fetch("http://localhost:5000/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const courseNames = Array.isArray(data)
            ? [...new Set(data.map((c) => c.course_name))]
            : [];
          setCourses(courseNames);
        })
        .catch((err) => console.error("Error fetching courses:", err));
    }
  }, [activeTab, token]);

  // --- Fetch reports
  useEffect(() => {
    if (activeTab === "reports") {
      let url = "http://localhost:5000/lecturer_reports";
      if (selectedCourse) url += `?course_name=${encodeURIComponent(selectedCourse)}`;

      fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setReports(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching reports:", err));
    }
  }, [activeTab, selectedCourse, token]);

  // --- Fetch ratings & students
  useEffect(() => {
    if (activeTab === "rating") {
      // Lecturer ratings
      fetch(`http://localhost:5000/student_ratings?lecturer_name=${encodeURIComponent(lecturerName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setRatings(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching ratings:", err));

      // Students list
      fetch("http://localhost:5000/students", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setStudents(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching students:", err));
    }
  }, [activeTab, lecturerName, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/lecturer_reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json().catch(() => null);
      setLoading(false);

      if (!res.ok) {
        setMessage(result?.message || `Failed. Status: ${res.status}`);
        setMessageType("error");
        return;
      }

      setMessage("✅ Report submitted successfully!");
      setMessageType("success");

      // Reset form
      setFormData({
        faculty_name: "",
        class_name: "",
        week_of_reporting: "",
        lecture_date: "",
        course_name: "",
        course_code: "",
        lecturer_name: lecturerName || "",
        students_present: "",
        total_students: "120",
        venue: "",
        lecture_time: "",
        topic_taught: "",
        learning_outcomes: "",
        recommendations: "",
      });
    } catch (err) {
      console.error("Error submitting report:", err);
      setMessage("❌ Error occurred.");
      setMessageType("error");
      setLoading(false);
    }
  };

  const handleStudentRating = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !studentRating) return alert("Please select a student and rating");

    try {
      const res = await fetch("http://localhost:5000/lecturer_rate_student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lecturer_name: lecturerName,
          student_name: selectedStudent,
          rating: parseInt(studentRating, 10),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit rating");
      alert("✅ Student rated successfully!");
      setSelectedStudent("");
      setStudentRating("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.container}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <span style={styles.navItem} onClick={() => setActiveTab("classes")}>📚 Classes</span>
        <span style={styles.navItem} onClick={() => setActiveTab("reports")}>📝 Reports</span>
        <span style={styles.navItem} onClick={() => setActiveTab("make-report")}>➕ Make Report</span>
        <span style={styles.navItem} onClick={() => setActiveTab("monitoring")}>📊 Monitoring</span>
        <span style={styles.navItem} onClick={() => setActiveTab("rating")}>⭐ Rating</span>
        <button onClick={handleLogout} style={styles.logoutButton}>🚪 Logout</button>
      </nav>

      {/* CLASSES TAB */}
      {activeTab === "classes" && (
        <div>
          <h2 style={styles.title}>📚 Your Classes</h2>
          {classes.length === 0 ? <p>No classes found.</p> : (
            <ul style={styles.list}>
              {classes.map((c, idx) => (
                <li key={idx} style={styles.card}>{c.class_name} - {c.course_name}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === "reports" && (
        <div>
          <h2 style={styles.title}>📝 Reports</h2>

          {/* Filter by course */}
          <select
            style={styles.input}
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>

          {reports.length === 0 ? <p>No reports found.</p> : (
            <ul style={styles.list}>
              {reports.map((r) => (
                <li key={r.id} style={styles.card}>
                  <strong>Course:</strong> {r.course_name} <br />
                  <strong>Class:</strong> {r.class_name} <br />
                  <strong>Week:</strong> {r.week_of_reporting} <br />
                  <strong>Topic:</strong> {r.topic_taught} <br />
                  <strong>Learning Outcomes:</strong> {r.learning_outcomes} <br />
                  <strong>Recommendations:</strong> {r.recommendations}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* MAKE REPORT TAB */}
      {activeTab === "make-report" && (
        <div>
          <h2 style={styles.title}>➕ Make Report</h2>
          {message && (
            <p style={{ color: messageType === "error" ? "#ff4c4c" : "#4caf50" }}>{message}</p>
          )}
          <form onSubmit={handleSubmit} style={styles.form}>
            {Object.keys(formData).map((key) => (
              key !== "lecturer_name" && (
                <input
                  key={key}
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  placeholder={key.replace("_", " ")}
                  style={styles.input}
                  required
                />
              )
            ))}
            <button type="submit" style={styles.button}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      )}

      {/* RATINGS TAB */}
      {activeTab === "rating" && (
        <div>
          <h2 style={styles.title}>⭐ Ratings for {lecturerName}</h2>
          {ratings.length === 0 ? <p>No ratings yet.</p> : (
            <ul style={styles.list}>
              {ratings.map((r) => (
                <li key={r.id} style={styles.card}>
                  <strong>Lecturer:</strong> {r.lecturer_name} <br />
                  <strong>Rating:</strong> {"⭐".repeat(r.rating)} ({r.rating}/5)
                </li>
              ))}
            </ul>
          )}

          <h3 style={{ marginTop: "20px" }}>Rate a Student</h3>
          <form onSubmit={handleStudentRating} style={styles.form}>
            <select
              style={styles.input}
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">Select Student</option>
              {students.map((s, idx) => (
                <option key={idx} value={s.student_name}>{s.student_name}</option>
              ))}
            </select>

            <select
              style={styles.input}
              value={studentRating}
              onChange={(e) => setStudentRating(e.target.value)}
              required
            >
              <option value="">Select Rating</option>
              {[1,2,3,4,5].map((val) => (
                <option key={val} value={val}>{val} ⭐</option>
              ))}
            </select>

            <button type="submit" style={styles.button}>Submit Rating</button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: {
    backgroundColor: "#121212",
    minHeight: "100vh",
    padding: "30px",
    color: "#fff",
    fontFamily: "Segoe UI, Arial, sans-serif",
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
  },
  navItem: { cursor: "pointer", fontWeight: "600", color: "#ffb703" },
  logoutButton: {
    marginLeft: "20px",
    padding: "6px 12px",
    backgroundColor: "#ff0000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  title: { textAlign: "center", marginBottom: "20px", color: "#f5f5f5" },
  list: { listStyle: "none", padding: 0 },
  card: {
    background: "#1f1f1f",
    padding: "15px",
    borderRadius: "8px",
    margin: "10px auto",
    maxWidth: "600px",
  },
  form: {
    backgroundColor: "#ffffff",
    color: "#000",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "500px",
    margin: "20px auto",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#ffb703",
    border: "none",
    borderRadius: "6px",
    color: "#000",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default LecturerDashboard;







