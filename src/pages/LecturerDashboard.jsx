import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Set your backend URL
const BACKEND_URL = "https://luctreportssystem-1a43-git-main-karabotlalis-projects.vercel.app";

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
      fetch(`${BACKEND_URL}/classes`, {
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
      fetch(`${BACKEND_URL}/classes`, {
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
      let url = `${BACKEND_URL}/lecturer_reports`;
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
      fetch(`${BACKEND_URL}/student_ratings?lecturer_name=${encodeURIComponent(lecturerName)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setRatings(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching ratings:", err));

      fetch(`${BACKEND_URL}/students`, {
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
      const res = await fetch(`${BACKEND_URL}/lecturer_reports`, {
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
      const res = await fetch(`${BACKEND_URL}/lecturer_rate_student`, {
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

  // ... rest of your JSX stays unchanged
};

export default LecturerDashboard;







