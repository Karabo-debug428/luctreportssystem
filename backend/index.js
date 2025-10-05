const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: "sql.freedb.tech",
  user: "freedb_karabotlali",
  password: "#GFXQr57FYFNnfs",
  database: "freedb_luct_system",
  port: 3306
});

db.connect(err => {
  if (err) console.error("DB connection failed:", err);
  else console.log("Connected to FreeDB successfully!");
});

// JWT secret
const JWT_SECRET = "supersecretkey";

// -------------------- AUTH --------------------
// REGISTER
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        return res.json({ message: "User registered successfully!" });
      }
    );
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "All fields required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(400).json({ message: "User not found" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role.toLowerCase(), name: user.name }, JWT_SECRET, { expiresIn: "1h" });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.toLowerCase() }
    });
  });
});

// -------------------- JWT MIDDLEWARE --------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Failed to authenticate token" });
    req.user = decoded;
    next();
  });
};

// -------------------- REPORTS --------------------
// SUBMIT LECTURER REPORT
app.post("/lecturer_reports", verifyToken, (req, res) => {
  const {
    faculty_name, class_name, week_of_reporting, lecture_date, course_name,
    course_code, lecturer_name, students_present, total_students, venue,
    lecture_time, topic_taught, learning_outcomes, recommendations
  } = req.body;

  if (!faculty_name || !class_name || !week_of_reporting || !lecture_date || !course_name || !course_code || !lecturer_name) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const created_at = new Date();

  const query = `
    INSERT INTO lecturer_reports
    (faculty_name, class_name, week_of_reporting, lecture_date, course_name, course_code, lecturer_name,
      students_present, total_students, venue, lecture_time, topic_taught, learning_outcomes, recommendations, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    faculty_name, class_name, week_of_reporting, lecture_date, course_name, course_code,
    lecturer_name, students_present, total_students, venue, lecture_time, topic_taught,
    learning_outcomes, recommendations, created_at
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to submit report" });
    res.json({ message: "Report submitted successfully", report_id: result.insertId });
  });
});

// GET LECTURER REPORTS (filtered by lecturer if role=lecturer)
app.get("/lecturer_reports", verifyToken, (req, res) => {
  let query = "SELECT * FROM lecturer_reports";
  const values = [];

  if (req.user.role === "lecturer") {
    query += " WHERE lecturer_name = ?";
    values.push(req.user.name);
  }

  query += " ORDER BY created_at DESC";

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch reports" });
    res.json(results);
  });
});

// GET CLASSES (unique class names, filtered by lecturer)
app.get("/classes", verifyToken, (req, res) => {
  let query = "SELECT DISTINCT class_name, course_name, lecturer_name FROM lecturer_reports";
  const values = [];

  if (req.user.role === "lecturer") {
    query += " WHERE lecturer_name = ?";
    values.push(req.user.name);
  }

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch classes" });
    res.json(results);
  });
});

// -------------------- STUDENT RATINGS -------------------

app.post("/student_ratings", verifyToken, (req, res) => {
  const { ratings } = req.body;
  if (!ratings || !Array.isArray(ratings)) return res.status(400).json({ message: "Invalid data" });

  const values = ratings.map(r => [r.student_name, r.lecturer_name, r.rating]);
  const query = "INSERT INTO student_ratings (student_name, lecturer_name, rating) VALUES ?";

  db.query(query, [values], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to save ratings" });
    res.json({ message: "Ratings saved successfully" });
  });
});

// GET RATINGS for lecturers (optional)
app.get("/student_ratings", verifyToken, (req, res) => {
  let query = "SELECT lecturer_name, AVG(rating) as avg_rating, COUNT(*) as total_votes FROM student_ratings GROUP BY lecturer_name";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch ratings" });
    res.json(results);
  });
});

// -------------------- START SERVER --------------------
// Before
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// After (for Vercel)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



