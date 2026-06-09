import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { analyzeResume, uploadResume } from "./api";

const SAMPLE_JOB =
  "Software Engineer Intern role requiring Python, React, SQL, REST API development, Git, data structures, algorithms, and basic cloud deployment experience. Candidate should build clean UI, integrate backend APIs, and write maintainable code.";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const canAnalyze = resumeText.trim().length > 20 && jobDescription.trim().length > 20;

  const scoreTone = useMemo(() => {
    const score = result?.match_score || 0;
    if (score >= 75) return "strong";
    if (score >= 55) return "medium";
    return "weak";
  }, [result]);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setResult(null);

    try {
      const data = await uploadResume(file);
      setResumeText(data.text);
      setFileName(data.filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    if (!canAnalyze) return;

    setError("");
    setLoading(true);

    try {
      const data = await analyzeResume({
        resume_text: resumeText,
        job_description: jobDescription,
        job_title: "Software Engineer Intern",
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Placement Project</p>
          <h1>AI Resume + Job Match Analyzer</h1>
        </div>
        <div className="status-pill">
          <Brain size={18} />
          NLP Scoring
        </div>
      </section>

      <section className="workspace">
        <div className="input-panel">
          <div className="panel-header">
            <FileText size={20} />
            <div>
              <h2>Resume</h2>
              <p>Upload a PDF or paste extracted text.</p>
            </div>
          </div>

          <label className="upload-zone">
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            {uploading ? <Loader2 className="spin" size={26} /> : <Upload size={26} />}
            <span>{fileName || "Choose resume PDF"}</span>
          </label>

          <textarea
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Paste resume text here if you do not want to upload a PDF."
            rows={12}
          />
        </div>

        <div className="input-panel">
          <div className="panel-header">
            <Sparkles size={20} />
            <div>
              <h2>Job Description</h2>
              <p>Paste the role requirements from LinkedIn, Naukri, or company careers page.</p>
            </div>
          </div>

          <textarea
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste job description here."
            rows={17}
          />

          <button className="primary-button" disabled={!canAnalyze || loading} onClick={handleAnalyze}>
            {loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />}
            Analyze Match
          </button>
        </div>
      </section>

      {error && (
        <section className="message error">
          <AlertCircle size={18} />
          {error}
        </section>
      )}

      {result && (
        <section className="results">
          <div className={`score-card ${scoreTone}`}>
            <div>
              <p className="eyebrow">Overall Match</p>
              <strong>{result.match_score}%</strong>
              <span>{result.summary}</span>
            </div>
            <div className="score-ring" style={{ "--score": `${result.match_score * 3.6}deg` }}>
              <span>{Math.round(result.match_score)}</span>
            </div>
          </div>

          <div className="metric-grid">
            <Metric label="Semantic Score" value={`${result.semantic_score}%`} />
            <Metric label="Skill Score" value={`${result.skill_score}%`} />
            <Metric label="Matched Skills" value={result.matched_skills.length} />
            <Metric label="Missing Skills" value={result.missing_skills.length} />
          </div>

          <div className="detail-grid">
            <SkillBox title="Matched Skills" skills={result.matched_skills} tone="matched" empty="No direct matches found." />
            <SkillBox title="Missing Skills" skills={result.missing_skills} tone="missing" empty="No important missing skills detected." />
          </div>

          <div className="suggestions">
            <div className="panel-header">
              <CheckCircle2 size={20} />
              <div>
                <h2>Resume Improvement Suggestions</h2>
                <p>Use these points to improve ATS fit and interview quality.</p>
              </div>
            </div>
            <ol>
              {result.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SkillBox({ title, skills, tone, empty }) {
  return (
    <div className="skill-box">
      <h3>{title}</h3>
      <div className="chips">
        {skills.length ? skills.map((skill) => <span className={`chip ${tone}`} key={skill}>{skill}</span>) : <p>{empty}</p>}
      </div>
    </div>
  );
}

export default App;
