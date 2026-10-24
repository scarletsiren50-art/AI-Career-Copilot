import { useEffect, useState } from "react";

type ResumeAnalysis = {
  id: number;
  filename: string;
  resume_text: string;
  career_summary: string;
  skills: string[];
  strengths: string[];
  skill_gaps: string[];
  recommended_roles: string[];
  learning_recommendations: string[];
  created_at: string;
  updated_at: string;
};

type DashboardProps = {
  user: {
    id: number;
    name: string;
    email: string;
  };
};

function Dashboard({ user }: DashboardProps) {
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<ResumeAnalysis | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    const loadAnalyses = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const token = localStorage.getItem(
          "career_copilot_token"
        );

        if (!token) {
          setErrorMessage(
            "Your session has expired. Please log in again."
          );
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

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(
            data.detail ||
              "Unable to load your resume analyses."
          );
          return;
        }

        if (data.success) {
          const savedAnalyses =
            data.analyses || [];

          setAnalyses(savedAnalyses);

          if (savedAnalyses.length > 0) {
            setSelectedAnalysis(
              savedAnalyses[0]
            );
          }
        }
      } catch (error) {
        console.error(
          "Dashboard analysis loading error:",
          error
        );

        setErrorMessage(
          "Unable to connect to the server."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyses();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "Date unavailable";
    }

    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getAnalysisNumber = (
    analysis: ResumeAnalysis
  ) => {
    const index = analyses.findIndex(
      (item) => item.id === analysis.id
    );

    return analyses.length - index;
  };

  const handleDeleteAnalysis = async () => {
  if (!selectedAnalysis) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete "${selectedAnalysis.filename}"?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  setIsDeleting(true);
  setDeleteMessage("");

  try {
    const token = localStorage.getItem(
      "career_copilot_token"
    );

    if (!token) {
      setDeleteMessage(
        "Your session has expired. Please log in again."
      );
      return;
    }

    const response = await fetch(
      `http://127.0.0.1:8000/resume-analysis/${selectedAnalysis.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setDeleteMessage(
        data.detail ||
          "Unable to delete this resume analysis."
      );
      return;
    }

    if (data.success) {
      const remainingAnalyses = analyses.filter(
        (analysis) =>
          analysis.id !== selectedAnalysis.id
      );

      setAnalyses(remainingAnalyses);

      if (remainingAnalyses.length > 0) {
        setSelectedAnalysis(
          remainingAnalyses[0]
        );
      } else {
        setSelectedAnalysis(null);
      }

      setDeleteMessage(
        "Resume analysis deleted successfully."
      );
    }
  } catch (error) {
    console.error(
      "Delete analysis error:",
      error
    );

    setDeleteMessage(
      "Unable to connect to the server. Please try again."
    );
  } finally {
    setIsDeleting(false);
  }
};

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-loading-icon">
            ✦
          </div>

          <h2>Loading your career workspace...</h2>

          <p>
            Retrieving your saved resume analyses.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            YOUR CAREER WORKSPACE
          </p>

          <h1>
            Welcome back, {user.name}.
          </h1>

          <p className="dashboard-subtitle">
            Access your saved resume analyses,
            career insights, and progress in one
            place.
          </p>
        </div>

        <div className="dashboard-stat">
          <span>RESUME ANALYSES</span>

          <strong>
            {analyses.length}
          </strong>
        </div>
      </section>

      {errorMessage && (
        <div className="dashboard-message">
          {errorMessage}
        </div>
      )}

      {!errorMessage &&
        analyses.length === 0 && (
          <section className="dashboard-empty">
            <div className="dashboard-empty-icon">
              📄
            </div>

            <h2>No resume analyses yet</h2>

            <p>
              Upload your resume from Career Copilot
              to create your first AI-powered career
              analysis.
            </p>
          </section>
        )}

      {analyses.length > 0 && (
        <section className="dashboard-workspace">
          <aside className="analysis-library">
            <div className="analysis-library-header">
              <div>
                <p className="dashboard-eyebrow">
                  SAVED WORK
                </p>

                <h2>Resume Analyses</h2>
              </div>

              <span className="analysis-count">
                {analyses.length}
              </span>
            </div>

            <div className="analysis-list">
              {analyses.map((analysis) => {
                const analysisNumber =
                  getAnalysisNumber(analysis);

                const isSelected =
                  selectedAnalysis?.id ===
                  analysis.id;

                return (
                  <button
                    key={analysis.id}
                    className={`analysis-list-item ${
                      isSelected
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedAnalysis(
                        analysis
                      )
                    }
                  >
                    <div className="analysis-list-icon">
                      📄
                    </div>

                    <div className="analysis-list-content">
                      <strong>
                        Resume Analysis #
                        {analysisNumber}
                      </strong>

                      <span>
                        {analysis.filename}
                      </span>

                      <small>
                        {formatDate(
                          analysis.created_at
                        )}
                      </small>
                    </div>

                    <span className="analysis-list-arrow">
                      →
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {selectedAnalysis && (
            <section className="analysis-detail">
              <div className="analysis-detail-header">
                <div>
                  <p className="dashboard-eyebrow">
                    RESUME ANALYSIS #
                    {getAnalysisNumber(
                      selectedAnalysis
                    )}
                  </p>

                  <h2>
                    {selectedAnalysis.filename}
                  </h2>

                  <p>
                    Analyzed on{" "}
                    {formatDate(
                      selectedAnalysis.created_at
                    )}
                  </p>
                </div>

                <div className="analysis-detail-actions">
                  <div className="analysis-status">
                    AI ANALYZED
                  </div>
                  <button
                    type="button"
                    className="analysis-delete-button"
                    onClick={handleDeleteAnalysis}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Analysis"}

                  </button>
                </div>
                {deleteMessage && (
                  <div className="analysis-delete-message">
                    {deleteMessage}
                  </div>
                )}
              </div>

              <div className="dashboard-summary">
                <span>CAREER PROFILE</span>

                <h3>
                  Career Summary
                </h3>

                <p>
                  {
                    selectedAnalysis.career_summary
                  }
                </p>
              </div>

              <div className="dashboard-analysis-grid">
                <div className="dashboard-analysis-card">
                  <h3>Skills</h3>

                  <div className="dashboard-tags">
                    {selectedAnalysis.skills?.map(
                      (skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="dashboard-analysis-card">
                  <h3>Strengths</h3>

                  <ul>
                    {selectedAnalysis.strengths?.map(
                      (strength, index) => (
                        <li key={index}>
                          {strength}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="dashboard-analysis-card">
                  <h3>Skill Gaps</h3>

                  <ul>
                    {selectedAnalysis.skill_gaps?.map(
                      (gap, index) => (
                        <li key={index}>
                          {gap}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="dashboard-analysis-card">
                  <h3>
                    Recommended Roles
                  </h3>

                  <ul>
                    {selectedAnalysis.recommended_roles?.map(
                      (role, index) => (
                        <li key={index}>
                          {role}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="dashboard-learning-card">
                <span>
                  PERSONALIZED LEARNING
                </span>

                <h3>
                  Learning Recommendations
                </h3>

                <ul>
                  {selectedAnalysis.learning_recommendations?.map(
                    (recommendation, index) => (
                      <li key={index}>
                        {recommendation}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </section>
          )}
        </section>
      )}
    </main>
  );
}

export default Dashboard;