const API_BASE = "https://luctreportssystem-1a43-git-main-karabotlalis-projects.vercel.app";
// Fetch Classes
useEffect(() => {
  if (activeTab !== "Classes") return;
  setLoading(true);
  setError("");
  const token = localStorage.getItem("token");
  fetch(`${API_BASE}/classes`, {
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
  fetch(`${API_BASE}/lecturer_reports`, {
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
  fetch(`${API_BASE}/student_my_ratings`, {
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
    const res = await fetch(`${API_BASE}/student_ratings`, {
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

