import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import DarkModeToggle from "./components/DarkModeToggle";
import "./index.css";

function Home() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Load Lottie animation
  useEffect(() => {
    fetch("/lottie/analyzing.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load animation", err));
  }, []);

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim()) {
      alert("Please upload resume and enter job description.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      const matchResult = result.result || result.error || "No result.";
      const existing = JSON.parse(localStorage.getItem("matchHistory")) || [];
      const updated = [
        { content: matchResult, timestamp: new Date().toISOString() },
        ...existing.slice(0, 4),
      ];
      localStorage.setItem("matchHistory", JSON.stringify(updated));

      navigate("/result", { state: { result: matchResult } });
    } catch (error) {
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Drag and Drop Handlers
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="home-wrapper">
      <DarkModeToggle /> {/* ✅ Step 2 Toggle placed here */}
      <div className="home-card">
        <img src="/logo.png" alt="Career Compass Logo" className="home-logo" />
        <h1 className="home-heading">🎯 Career Compass</h1>

        {/* ✅ Drag & Drop Zone */}
        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current.click()}
        >
          {file ? (
            <p>📄 Selected: {file.name}</p>
          ) : (
            <p>📂 Drag & drop your resume here or click to browse</p>
          )}
        </div>

        {/* ✅ Hidden input for fallback */}
        <input
          type="file"
          accept=".pdf,.txt"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="home-input"
          style={{ display: "none" }}
        />

        <textarea
          className="home-textarea"
          placeholder="Paste job description here..."
          rows={5}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? "Analyzing..." : "🚀 Analyze Fit"}
        </button>

        {isLoading && animationData && (
          <div className="lottie-container">
            <Lottie animationData={animationData} loop autoplay />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
