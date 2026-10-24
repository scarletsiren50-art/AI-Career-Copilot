import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Auth from "./components/Auth";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Dashboard from "./components/Dashboard";

type ResumeAnalysis = {
  career_summary: string;
  skills: string[];
  strengths: string[];
  skill_gaps: string[];
  recommended_roles: string[];
  learning_recommendations: string[];
};

type RoadmapStep = {
  step_number: number;
  title: string;
  focus: string;
  actions: string[];
  expected_outcome: string;
};

type CareerRoadmap = {
  career_goal: string;
  current_level: string;
  roadmap_summary: string;
  steps: RoadmapStep[];
};

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(() => {
    const savedUser = localStorage.getItem("career_copilot_user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [resumeText, setResumeText] = useState<string>("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  useEffect(() => {
    if (!user) {
      return;
    }
    const loadSavedAnalysis = async () => {
      try {
        const token = localStorage.getItem(
          "career_copilot_token"
        );
        if (!token) {
          return;
        }
        const response = await fetch(
          "http://127.0.0.1:8000/resume-analysis",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 404) {
          return;
        }
        if (!response.ok) {
          console.error(
            "Unable to load saved resume analysis."
          );
          return;
        }
        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          setResumeText(
            data.analysis.resume_text || ""
          );
          setUploadedFile(
            data.analysis.filename || null
          );
        }
      } catch (error) {
        console.error(
          "Error loading saved resume analysis:",
          error
        );
      }
    };
    loadSavedAnalysis();
  }, [user]);

  type JobMatch = {
    match_score: number;
    match_summary: string;
    matching_skills: string[];
    missing_skills: string[];
    strengths: string[];
    recommendations: string[];
  };

  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapMessage, setRoadmapMessage] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobMatch, setJobMatch] = useState<JobMatch | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [jobMatchMessage, setJobMatchMessage] = useState("");

  const handleLoginSuccess = (loggedInUser: {
    id: number;
    name: string;
    email: string;
  }) => {
    setUser(loggedInUser);

    localStorage.setItem(
      "career_copilot_user",
      JSON.stringify(loggedInUser)
    );
    setShowDashboard(true);
    setShowProfile(false);
    setShowSettings(false);
  };

  const handleLogout = () => {
  setUser(null);

  localStorage.removeItem(
    "career_copilot_user"
  );

  localStorage.removeItem(
    "career_copilot_token"
  );
};

const handleSectionNavigation = (sectionId: string) => {
  // Return to the main Career Copilot page
  setShowDashboard(false);
  setShowProfile(false);
  setShowSettings(false);

  // Wait for React to render the Career Copilot page
  // before trying to scroll to the requested section.
  window.setTimeout(() => {
    const section = document.getElementById(sectionId);

    section?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
};

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    setUploadMessage("Please upload a PDF file.");
    return;
  }

  setSelectedFile(file);
  setIsUploading(true);
  setUploadMessage("");
  setUploadedFile(null);
  setAnalysis(null);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem(
      "career_copilot_token"
    );

    if (!token) {
      setUploadMessage(
        "You are not authenticated. Please log in again."
      );
      return;
    }

    const response = await fetch(
      "http://127.0.0.1:8000/upload-resume",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    console.log(
      "Upload response status:",
      response.status
    );

    console.log(
      "Upload response:",
      data
    );

    if (!response.ok) {
      setUploadMessage(
        data.detail ||
          data.message ||
          `Upload failed with status ${response.status}.`
      );
      return;
    }

    if (data.success) {
      setUploadedFile(data.filename);
      setResumeText(data.resume_text);
      setAnalysis(data.analysis);
      setUploadMessage(
        data.message ||
          "Resume analyzed successfully!"
      );
    } else {
      setUploadMessage(
        data.message ||
          "Unable to analyze your resume."
      );
    }

  } catch (error) {
    console.error(
      "Resume upload error:",
      error
    );

    setUploadMessage(
      error instanceof Error
        ? error.message
        : "Unable to connect to the backend server."
    );

  } finally {
    setIsUploading(false);
  }
};

  const generateRoadmap = async () => {
    if (!resumeText || !analysis) {
      return;
    }

    if (!jobDescription.trim()) {
      setRoadmapMessage(
        "Please enter and analyze a job description first."
      );
      return;
    }

    if (!jobMatch) {
      setRoadmapMessage("Please analyze the job match first.");
      return;
    }

    setIsGeneratingRoadmap(true);
    setRoadmapMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/career-roadmap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_text: resumeText,
            recommended_role: analysis.recommended_roles[0],
            job_description: jobDescription,
            missing_skills: jobMatch.missing_skills,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setRoadmap(data.roadmap);
      } else {
        setRoadmapMessage(
          data.message || "Unable to generate career roadmap."
        );
      }
    } catch (error) {
      console.error("Roadmap generation failed:", error);

      setRoadmapMessage(
        "Something went wrong while generating your roadmap."
      );
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleJobMatch = async () => {
    if (!resumeText.trim()) {
      setJobMatchMessage(
        "Please upload and analyze your resume first."
      );
      return;
    }

    if (!jobDescription.trim()) {
      setJobMatchMessage(
        "Please enter a job description."
      );
      return;
    }

    setIsMatching(true);
    setJobMatchMessage("");
    setJobMatch(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/match-job",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_text: resumeText,
            job_description: jobDescription,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setJobMatch(data.job_match);
        setJobMatchMessage("");
      } else {
        setJobMatchMessage(
          data.message || "Unable to analyze the job match."
        );
      }
    } catch (error) {
      console.error(error);

      setJobMatchMessage(
        "Something went wrong while analyzing the job."
      );
    } finally {
      setIsMatching(false);
    }
  };

  /*
   * Show authentication screen when no user is logged in.
   */
  if (!user) {
    return (
      <div className="app">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onProfile={() => setShowProfile(true)}
        />

        <Auth
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }
  if (showDashboard) {
  return (
    <div className="app">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onProfile={() => {
          setShowDashboard(false);
          setShowProfile(true);
        }}
        onSettings={() => {
          setShowDashboard(false);
          setShowSettings(true);
        }}
        onDashboard={() => setShowDashboard(true)}
        onCareerCopilot={() => {
          setShowDashboard(false);
          setShowProfile(false);
          setShowSettings(false);
        }}
        onFeatures={() => handleSectionNavigation("features")}
        onHowItWorks={() => handleSectionNavigation("how-it-works")}
      />

      <Dashboard user={user} />
    </div>
  );
}
  if (showSettings) {
  return (
    <div className="app">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onProfile={() => setShowProfile(true)}
        onSettings={() => setShowSettings(true)}
        onDashboard={() => setShowDashboard(true)}
        onCareerCopilot={() => {
          setShowDashboard(false);
          setShowProfile(false);
          setShowSettings(false);
        }}
        onFeatures={() => handleSectionNavigation("features")}
        onHowItWorks={() => handleSectionNavigation("how-it-works")}
      />

      <Settings
        user={user}
        onBack={() => setShowSettings(false)}
      />
    </div>
  );
}
  if (showProfile) {
  return (
    <div className="app">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onProfile={() => setShowProfile(true)}
        onSettings={() => setShowSettings(true)}
        onDashboard={() => setShowDashboard(true)}
        onCareerCopilot={() => {
          setShowProfile(false);
          setShowDashboard(false);
          setShowSettings(false);
      }}
      onFeatures={() => handleSectionNavigation("features")}
      onHowItWorks={() => handleSectionNavigation("how-it-works")}
      />

      <Profile
        user={user}
        onBack={() => setShowProfile(false)}
        onUserUpdated={(updatedUser) => {
          setUser(updatedUser); 
        }}
      />
    </div>
  );
}

  /*
   * Main Career Copilot application.
   */
  return (
    <div className="app">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onProfile={() => setShowProfile(true)}
        onSettings={() => setShowSettings(true)}
        onDashboard={() => setShowDashboard(true)}
        onCareerCopilot={() => {
          setShowSettings(false);
          setShowDashboard(false);
          setShowProfile(false);
      }}
      onFeatures={() => handleSectionNavigation("features")}
      onHowItWorks={() => handleSectionNavigation("how-it-works")}
      />

      <main>
        <Hero />

        <Features />

        <HowItWorks />

        {/* Resume Upload Section */}
        <section
          className="resume-upload"
          id="resume-upload"
        >
          <div className="resume-upload-content">
            <p className="section-eyebrow">
              GET STARTED
            </p>

            <h2>
              Start with your resume.
            </h2>

            <p>
              Upload your resume and let Career Copilot turn your
              experience into actionable career insights.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <button
              className="primary-button"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading
                ? "Analyzing..."
                : "Upload Resume"}
            </button>

            {uploadMessage && (
              <div className="upload-result">
                {uploadedFile ? (
                  <>
                    <strong>
                      ✅ Resume analyzed successfully
                    </strong>

                    <span>
                      {uploadedFile}
                    </span>
                  </>
                ) : (
                  <span>
                    {uploadMessage}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* AI Career Analysis */}
        {analysis && (
          <section
            className="career-analysis"
            id="career-analysis"
          >
            <div className="career-analysis-header">
              <p className="section-eyebrow">
                AI CAREER INSIGHTS
              </p>

              <h2>
                Your career analysis.
              </h2>

              <p>
                Based on the skills, experience, and projects
                found in your resume.
              </p>
            </div>

            {/* Career Summary */}
            <div className="analysis-summary">
              <div className="analysis-summary-label">
                CAREER PROFILE
              </div>

              <h3>
                Career Summary
              </h3>

              <p>
                {analysis.career_summary}
              </p>
            </div>

            {/* Analysis Cards */}
            <div className="analysis-grid">

              {/* Skills */}
              <div className="analysis-card">
                <h3>
                  Skills
                </h3>

                <div className="tag-list">
                  {(analysis.skills ?? []).map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="analysis-tag"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Strengths */}
              <div className="analysis-card">
                <h3>
                  Strengths
                </h3>

                <ul>
                  {(analysis.strengths ?? []).map(
                    (strength, index) => (
                      <li key={index}>
                        {strength}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Skill Gaps */}
              <div className="analysis-card">
                <h3>
                  Skill Gaps
                </h3>

                <ul>
                  {(analysis.skill_gaps ?? []).map(
                    (gap, index) => (
                      <li key={index}>
                        {gap}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Recommended Roles */}
              <div className="analysis-card">
                <h3>
                  Recommended Roles
                </h3>

                <ul>
                  {(analysis.recommended_roles ?? []).map(
                    (role, index) => (
                      <li key={index}>
                        {role}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Learning Recommendations */}
              <div className="analysis-card analysis-card-wide">
                <h3>
                  Learning Recommendations
                </h3>

                <ul>
                  {(analysis.learning_recommendations ?? []).map(
                    (recommendation, index) => (
                      <li key={index}>
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </div>

            </div>
          </section>
        )}

        {/* Job Match Section */}
        {analysis && (
          <section
            className="job-match"
            id="job-match"
          >
            <div className="job-match-header">
              <p className="section-eyebrow">
                <i>Job Match</i>
              </p>

              <h2>
                FIND YOUR JOB MATCH.
              </h2>

              <p>
                Compare your resume with a job opportunity and
                discover how well your profile fits the role.
              </p>
            </div>

            <div className="job-match-form">

              <div className="job-input-group">
                <label htmlFor="job-title">
                  Job Title
                </label>

                <input
                  id="job-title"
                  type="text"
                  placeholder="e.g. Junior Front-End Developer"
                  value={jobTitle}
                  onChange={(event) =>
                    setJobTitle(event.target.value)
                  }
                />
              </div>

              <div className="job-input-group">
                <label htmlFor="job-description">
                  Job Description
                </label>

                <textarea
                  id="job-description"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(event) =>
                    setJobDescription(event.target.value)
                  }
                  rows={9}
                />
              </div>

              <button
                className="primary-button job-match-button"
                onClick={handleJobMatch}
                disabled={isMatching}
              >
                {isMatching
                  ? "Analyzing Match..."
                  : "Analyze Match"}
              </button>

              {jobMatchMessage && (
                <p className="job-match-message">
                  {jobMatchMessage}
                </p>
              )}
            </div>

            {/* Job Match Results */}
            {jobMatch && (
              <div className="job-match-results">

                {/* Match Score */}
                <div className="match-score-card">
                  <p>
                    YOUR MATCH SCORE
                  </p>

                  <div className="match-score">
                    {jobMatch.match_score}%
                  </div>

                  <p>
                    {jobMatch.match_summary}
                  </p>
                </div>

                {/* Results Grid */}
                <div className="job-match-grid">

                  {/* Matching Skills */}
                  <div className="analysis-card">
                    <h3>
                      Matching Skills
                    </h3>

                    <div className="tag-list">
                      {(jobMatch.matching_skills ?? []).map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="analysis-tag"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="analysis-card">
                    <h3>
                      Missing Skills
                    </h3>

                    <ul>
                      {(jobMatch.missing_skills ?? []).map(
                        (skill, index) => (
                          <li key={index}>
                            {skill}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Strengths */}
                  <div className="analysis-card">
                    <h3>
                      Your Strengths
                    </h3>

                    <ul>
                      {(jobMatch.strengths ?? []).map(
                        (strength, index) => (
                          <li key={index}>
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="analysis-card">
                    <h3>
                      Recommendations
                    </h3>

                    <ul>
                      {(jobMatch.recommendations ?? []).map(
                        (recommendation, index) => (
                          <li key={index}>
                            {recommendation}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                </div>
              </div>
            )}
          </section>
        )}

        {/* Career Roadmap Trigger */}
        {analysis && jobMatch && !roadmap && (
          <section className="roadmap-trigger">
            <div className="roadmap-trigger-content">

              <p className="section-eyebrow">
                NEXT STEP
              </p>

              <h2>
                Ready to build your career roadmap?
              </h2>

              <p>
                Get a personalized step-by-step plan based on your
                resume, target role, and job match results.
              </p>

              <button
                className="primary-button"
                onClick={generateRoadmap}
                disabled={isGeneratingRoadmap}
              >
                {isGeneratingRoadmap
                  ? "Generating Roadmap..."
                  : "Generate Career Roadmap"}
              </button>

              {roadmapMessage && (
                <p className="roadmap-message">
                  {roadmapMessage}
                </p>
              )}

            </div>
          </section>
        )}

        {/* Career Roadmap */}
        {roadmap && (
          <section
            className="career-roadmap"
            id="career-roadmap"
          >
            <div className="career-roadmap-header">

              <p className="section-eyebrow">
                <i>Your Path Forward</i>
              </p>

              <h2>
                YOUR CAREER ROADMAP.
              </h2>

              <p>
                A personalized plan based on your current skills,
                target career, and job requirements.
              </p>

            </div>

            {/* Roadmap Overview */}
            <div className="roadmap-overview">

              <div className="roadmap-overview-card">
                <span className="roadmap-card-label">
                  CAREER GOAL
                </span>

                <h3>
                  {roadmap.career_goal}
                </h3>
              </div>

              <div className="roadmap-overview-card">
                <span className="roadmap-card-label">
                  CURRENT LEVEL
                </span>

                <h3>
                  {roadmap.current_level}
                </h3>
              </div>

              <div className="roadmap-overview-card roadmap-overview-wide">
                <span className="roadmap-card-label">
                  ROADMAP OVERVIEW
                </span>

                <p>
                  {roadmap.roadmap_summary}
                </p>
              </div>

            </div>

            {/* Roadmap Steps */}
            <div className="roadmap-steps">

              {roadmap.steps.map((step) => (
                <div
                  className="roadmap-step"
                  key={step.step_number}
                >

                  <div className="roadmap-step-number">
                    {String(step.step_number).padStart(2, "0")}
                  </div>

                  <div className="roadmap-step-content">

                    <p className="roadmap-focus">
                      {step.focus}
                    </p>

                    <h3>
                      {step.title}
                    </h3>

                    <div className="roadmap-actions">
                      {step.actions.map(
                        (action, index) => (
                          <div
                            className="roadmap-action"
                            key={index}
                          >
                            <span>✓</span>
                            <p>{action}</p>
                          </div>
                        )
                      )}
                    </div>

                    <div className="roadmap-outcome">
                      <strong>
                        Expected Outcome
                      </strong>

                      <p>
                        {step.expected_outcome}
                      </p>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;