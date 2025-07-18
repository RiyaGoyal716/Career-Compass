import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import SkillMatchChart from "./SkillMatchChart";
import MatchHistory from "./MatchHistory";
import parseMatchResult from "../utils/parseMatchResult";

function MatchResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  const result = location.state?.result || "No result found.";
  const { skills, score, keywords } = parseMatchResult(result);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Career Compass - Match Result", 20, 20);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(result, 180);
    doc.text(lines, 20, 40);
    doc.save("match-result.pdf");
  };

  const goHome = () => navigate("/");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const highlightKeywords = (text, keywords) => {
    let formatted = text;
    keywords.forEach((word) => {
      const regex = new RegExp(`(${word})`, "gi");
      formatted = formatted.replace(regex, `<mark>$1</mark>`);
    });
    return formatted;
  };

  return (
   <div className="app">
  <div className="sticky-header">
    <img src="/logo.png" alt="Career Compass Logo" className="logo" />
    <h1>📋 Match Result</h1>
    
  </div>

  <div className="result-layout">
    <div className="result-card">
      <h2>📌 Analysis:</h2>
      <pre dangerouslySetInnerHTML={{ __html: highlightKeywords(result, keywords) }}></pre>
    </div>

    {skills.length > 0 && (
      <div className="chart-card">
        <SkillMatchChart skills={skills} />
      </div>
    )}
  </div>

  <MatchHistory />

  <div className="button-row">
    <button className="pdf-button" onClick={downloadPDF}>📥 Download PDF</button>
    <button className="pdf-button" onClick={goHome}>🔄 Back to Home</button>
    <button className="pdf-button" onClick={() => setIsDark(!isDark)}>
      {isDark ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  </div>
</div>
  );
}

export default MatchResult;
