import { useEffect, useState } from "react";

type AIPreferencesProps = {
  user: {
    id: number;
    name: string;
    email: string;
  };
};

const careerGoals = [
  "Internship",
  "Full-Time Job",
  "Higher Studies",
  "Career Switch",
];

const experienceLevels = [
  "Student",
  "Entry Level",
  "1–3 Years",
  "3+ Years",
];

const careerAreas = [
  "AI / ML",
  "Data Science",
  "Frontend Development",
  "Backend Development",
  "Full Stack",
  "Other",
];

const responseStyles = [
  "Concise",
  "Balanced",
  "Detailed",
];

function AIPreferences({ user }: AIPreferencesProps) {
  const [careerGoal, setCareerGoal] = useState("Full-Time Job");
  const [experienceLevel, setExperienceLevel] = useState("Student");
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [responseStyle, setResponseStyle] = useState("Balanced");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  /*
   * Load the user's saved preferences
   */
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const token = localStorage.getItem(
          "career_copilot_token"
        );

        if (!token) {
          setMessage(
            "You are not authenticated. Please log in again."
          );
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:8000/preferences/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.detail ||
              "Unable to load AI preferences."
          );
          return;
        }

        setCareerGoal(
          data.preferences.career_goal
        );

        setExperienceLevel(
          data.preferences.experience_level
        );

        setPreferredRoles(
          data.preferences.preferred_roles || []
        );

        setResponseStyle(
          data.preferences.response_style
        );
      } catch (error) {
        console.error(
          "Error loading AI preferences:",
          error
        );

        setMessage(
          "Unable to connect to the server."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user.id]);

  /*
   * Toggle preferred career areas
   */
  const toggleCareerArea = (area: string) => {
    setPreferredRoles((currentRoles) => {
      if (currentRoles.includes(area)) {
        return currentRoles.filter(
          (role) => role !== area
        );
      }

      return [...currentRoles, area];
    });
  };

  /*
   * Save preferences
   */
  const handleSave = async () => {
    setMessage("");
    setIsSaving(true);

    try {
      const token = localStorage.getItem(
        "career_copilot_token"
      );

      if (!token) {
        setMessage(
          "You are not authenticated. Please log in again."
        );
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/preferences/${user.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            career_goal: careerGoal,
            experience_level: experienceLevel,
            preferred_roles: preferredRoles,
            response_style: responseStyle,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Unable to save AI preferences."
        );
        return;
      }

      setMessage(
        "AI preferences saved successfully!"
      );
    } catch (error) {
      console.error(
        "Error saving AI preferences:",
        error
      );

      setMessage(
        "Unable to connect to the server."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ai-preferences-panel">
        <p className="settings-loading">
          Loading your AI preferences...
        </p>
      </div>
    );
  }

  return (
    <div className="ai-preferences-panel">

      {/* Header */}
      <div className="settings-panel-header">
        <p className="settings-panel-eyebrow">
          PERSONALIZATION
        </p>

        <h2>AI Preferences</h2>

        <p>
          Customize how Career Copilot understands
          your goals and provides AI-powered guidance.
        </p>
      </div>

      <div className="settings-divider" />

      {/* Career Goal */}
      <div className="ai-preference-section">
        <div className="ai-preference-heading">
          <h3>Career Goal</h3>

          <p>
            What are you currently working towards?
          </p>
        </div>

        <div className="ai-option-grid">
          {careerGoals.map((goal) => (
            <button
              key={goal}
              type="button"
              className={`ai-option-card ${
                careerGoal === goal
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setCareerGoal(goal)
              }
            >
              <span className="ai-option-radio">
                {careerGoal === goal ? "✓" : ""}
              </span>

              <span>{goal}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="ai-preference-section">
        <div className="ai-preference-heading">
          <h3>Experience Level</h3>

          <p>
            This helps the AI tailor recommendations
            to your current stage.
          </p>
        </div>

        <div className="ai-option-grid">
          {experienceLevels.map((level) => (
            <button
              key={level}
              type="button"
              className={`ai-option-card ${
                experienceLevel === level
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setExperienceLevel(level)
              }
            >
              <span className="ai-option-radio">
                {experienceLevel === level
                  ? "✓"
                  : ""}
              </span>

              <span>{level}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Career Areas */}
      <div className="ai-preference-section">
        <div className="ai-preference-heading">
          <h3>Preferred Career Areas</h3>

          <p>
            Select the areas you want Career Copilot
            to prioritize.
          </p>
        </div>

        <div className="ai-option-grid">
          {careerAreas.map((area) => (
            <button
              key={area}
              type="button"
              className={`ai-option-card ${
                preferredRoles.includes(area)
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                toggleCareerArea(area)
              }
            >
              <span className="ai-option-radio">
                {preferredRoles.includes(area)
                  ? "✓"
                  : ""}
              </span>

              <span>{area}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Response Style */}
      <div className="ai-preference-section">
        <div className="ai-preference-heading">
          <h3>AI Response Style</h3>

          <p>
            Choose how detailed you want your AI
            recommendations to be.
          </p>
        </div>

        <div className="ai-option-grid response-style-grid">
          {responseStyles.map((style) => (
            <button
              key={style}
              type="button"
              className={`ai-option-card ${
                responseStyle === style
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setResponseStyle(style)
              }
            >
              <span className="ai-option-radio">
                {responseStyle === style
                  ? "✓"
                  : ""}
              </span>

              <span>{style}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="ai-preferences-actions">
        {message && (
          <p className="ai-preferences-message">
            {message}
          </p>
        )}

        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving
            ? "Saving Preferences..."
            : "Save Preferences"}
        </button>
      </div>

    </div>
  );
}

export default AIPreferences;