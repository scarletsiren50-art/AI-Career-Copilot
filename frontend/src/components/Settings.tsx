import AIPreferences from "./AIPreferences";
import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type SettingsProps = {
  user: {
    id: number;
    name: string;
    email: string;
  };
  onBack: () => void;
};

function Settings({ user, onBack }: SettingsProps) {
  const [activeSection, setActiveSection] = useState("account");

  // =========================
  // PASSWORD STATE
  // =========================

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // =========================
  // CONTACT FORM STATE
  // =========================

  const [contactName, setContactName] = useState(user.name);
  const [contactEmail, setContactEmail] = useState(user.email);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const [contactStatus, setContactStatus] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);

  // =========================
  // DELETE ACCOUNT STATE
  // =========================

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async () => {
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage(
        "New password must be at least 8 characters long."
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = localStorage.getItem("career_copilot_token");

      if (!token) {
        setPasswordMessage("Not authenticated. Please log in again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            current_password: currentPassword,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage(
          data.detail || "Unable to change password."
        );
        return;
      }

      setPasswordMessage("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordMessage("");
      }, 1500);
    } catch (error) {
      console.error("Password change error:", error);

      setPasswordMessage(
        "Unable to connect to the server."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // =========================
  // CONTACT US
  // =========================

  const handleContactSubmit = async () => {
  setContactStatus("");

  const trimmedName = contactName.trim();
  const trimmedEmail = contactEmail.trim();
  const trimmedSubject = contactSubject.trim();
  const trimmedMessage = contactMessage.trim();

  // Frontend validation
  if (
    !trimmedName ||
    !trimmedEmail ||
    !trimmedSubject ||
    !trimmedMessage
  ) {
    setContactStatus(
      "Please fill in all the fields before sending your message."
    );
    return;
  }

  if (trimmedName.length < 2) {
    setContactStatus(
      "Please enter a valid name with at least 2 characters."
    );
    return;
  }

  if (trimmedSubject.length < 3) {
    setContactStatus(
      "Please enter a subject with at least 3 characters."
    );
    return;
  }

  if (trimmedMessage.length < 10) {
    setContactStatus(
      "Please enter a message with at least 10 characters."
    );
    return;
  }

  // Basic email validation
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    setContactStatus(
      "Please enter a valid email address."
    );
    return;
  }

  setIsSendingContact(true);

  try {
    const response = await fetch(
      `${API_BASE_URL}/contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // FastAPI validation errors can return detail as an array
      if (Array.isArray(data.detail)) {
        const validationMessages = data.detail
          .map((error: any) => error.msg)
          .filter(Boolean)
          .join(" ");

        setContactStatus(
          validationMessages ||
            "Please check the information you entered."
        );
      } else {
        setContactStatus(
          data.detail ||
            "Unable to send your message right now."
        );
      }

      return;
    }

    setContactStatus(
      "Your message has been sent successfully! We'll get back to you soon."
    );

    setContactSubject("");
    setContactMessage("");
  } catch (error) {
    console.error(
      "Contact form error:",
      error
    );

    setContactStatus(
      "Unable to connect to the server. Please try again."
    );
  } finally {
    setIsSendingContact(false);
  }
};

  // =========================
  // DELETE ACCOUNT
  // =========================

  const handleDeleteAccount = async () => {
  setDeleteMessage("");

  if (!deletePassword.trim()) {
    setDeleteMessage(
      "Please enter your current password."
    );
    return;
  }

  setIsDeletingAccount(true);

  try {
    const token = localStorage.getItem(
      "career_copilot_token"
    );

    if (!token) {
      setDeleteMessage(
        "You are not authenticated. Please log in again."
      );
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/auth/delete-account`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: deletePassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setDeleteMessage(
        data.detail ||
          "Unable to delete your account."
      );
      return;
    }

    // Account was successfully deleted
    localStorage.removeItem(
      "career_copilot_user"
    );

    localStorage.removeItem(
      "career_copilot_token"
    );

    setDeleteMessage(
      "Your account has been permanently deleted."
    );

    setTimeout(() => {
      window.location.reload();
    }, 1200);

  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );

    setDeleteMessage(
      "Unable to connect to the server. Please try again."
    );
  } finally {
    setIsDeletingAccount(false);
  }
};

  // =========================
  // CLOSE DELETE MODAL
  // =========================

  const closeDeleteModal = () => {
    if (isDeletingAccount) {
      return;
    }

    setShowDeleteModal(false);
    setDeletePassword("");
    setDeleteMessage("");
  };

  return (
    <section className="settings-page">
      <div className="settings-container">

        {/* =========================
            BACK BUTTON
            ========================= */}

        <button
          type="button"
          className="settings-back-button"
          onClick={onBack}
        >
          ← Back to Career Copilot
        </button>

        {/* =========================
            SETTINGS HEADER
            ========================= */}

        <div className="settings-header">
          <p className="section-eyebrow">
            ACCOUNT
          </p>

          <h1>Settings</h1>

          <p>
            Manage your account, security, AI preferences,
            and other Career Copilot settings.
          </p>
        </div>

        <div className="settings-layout">

          {/* =========================
              SIDEBAR
              ========================= */}

          <aside className="settings-sidebar">

            <button
              type="button"
              className={
                activeSection === "account"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveSection("account")
              }
            >
              <span>🔐</span>
              <span>Account & Security</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "ai"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveSection("ai")
              }
            >
              <span>🤖</span>
              <span>AI Preferences</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "contact"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveSection("contact")
              }
            >
              <span>✉️</span>
              <span>Contact Us</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "about"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveSection("about")
              }
            >
              <span>ℹ️</span>
              <span>About Career Copilot</span>
            </button>

            <button
              type="button"
              className={
                activeSection === "danger"
                  ? "settings-nav-item danger active"
                  : "settings-nav-item danger"
              }
              onClick={() =>
                setActiveSection("danger")
              }
            >
              <span>⚠️</span>
              <span>Danger Zone</span>
            </button>

          </aside>

          {/* =========================
              CONTENT
              ========================= */}

          <div className="settings-content">

            {/* ==================================================
                ACCOUNT & SECURITY
                ================================================== */}

            {activeSection === "account" && (
              <div className="settings-card">

                <div className="settings-card-header">
                  <div>
                    <p className="settings-card-eyebrow">
                      SECURITY
                    </p>

                    <h2>
                      Account & Security
                    </h2>

                    <p>
                      Manage your account credentials and
                      security settings.
                    </p>
                  </div>
                </div>

                <div className="settings-divider" />

                <div className="settings-section">

                  <h3>
                    Account Information
                  </h3>

                  <div className="settings-info-grid">

                    <div className="settings-info-item">
                      <span>Full Name</span>
                      <strong>{user.name}</strong>
                    </div>

                    <div className="settings-info-item">
                      <span>Email Address</span>
                      <strong>{user.email}</strong>
                    </div>

                  </div>

                </div>

                <div className="settings-divider" />

                <div className="settings-section">

                  <h3>Password</h3>

                  <p className="settings-description">
                    Keep your account secure by using a strong,
                    unique password.
                  </p>

                  <button
                    type="button"
                    className="settings-action-button"
                    onClick={() => {
                      setShowPasswordForm(
                        !showPasswordForm
                      );
                      setPasswordMessage("");
                    }}
                  >
                    {showPasswordForm
                      ? "Cancel Password Change"
                      : "Change Password"}
                  </button>

                  {showPasswordForm && (
                    <div className="password-form">

                      <div className="password-form-field">

                        <label htmlFor="current-password">
                          Current Password
                        </label>

                        <input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(
                              event.target.value
                            )
                          }
                          placeholder="Enter your current password"
                        />

                      </div>

                      <div className="password-form-field">

                        <label htmlFor="new-password">
                          New Password
                        </label>

                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(event) =>
                            setNewPassword(
                              event.target.value
                            )
                          }
                          placeholder="Enter your new password"
                        />

                      </div>

                      <div className="password-form-field">

                        <label htmlFor="confirm-password">
                          Confirm New Password
                        </label>

                        <input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(
                              event.target.value
                            )
                          }
                          placeholder="Confirm your new password"
                        />

                      </div>

                      {passwordMessage && (
                        <p className="password-message">
                          {passwordMessage}
                        </p>
                      )}

                      <button
                        type="button"
                        className="primary-button"
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword
                          ? "Updating Password..."
                          : "Update Password"}
                      </button>

                    </div>
                  )}

                </div>

                <div className="settings-divider" />

                <div className="settings-section">

                  <h3>
                    Session Security
                  </h3>

                  <p className="settings-description">
                    You're currently signed in to Career Copilot
                    on this device.
                  </p>

                  <button
                    type="button"
                    className="settings-secondary-button"
                  >
                    Sign Out of Other Sessions
                  </button>

                </div>

              </div>
            )}

            {/* ==================================================
                AI PREFERENCES
                ================================================== */}

            {activeSection === "ai" && (
              <AIPreferences user={user} />
            )}

            {/* ==================================================
                CONTACT US
                ================================================== */}

            {activeSection === "contact" && (
              <div className="settings-card">

                <div className="settings-card-header">

                  <div>
                    <p className="settings-card-eyebrow">
                      SUPPORT
                    </p>

                    <h2>
                      Contact Us
                    </h2>

                    <p>
                      Have a question, suggestion, or need
                      help with Career Copilot?
                    </p>
                  </div>

                </div>

                <div className="settings-divider" />

                <div className="settings-section">

                  <h3>
                    Send us a message
                  </h3>

                  <p className="settings-description">
                    Fill out the form below and your message
                    will be securely sent to the Career Copilot
                    support team.
                  </p>

                  <div className="password-form">

                    <div className="password-form-field">

                      <label htmlFor="contact-name">
                        Your Name
                      </label>

                      <input
                        id="contact-name"
                        type="text"
                        value={contactName}
                        onChange={(event) =>
                          setContactName(
                            event.target.value
                          )
                        }
                        placeholder="Enter your name"
                      />

                    </div>

                    <div className="password-form-field">

                      <label htmlFor="contact-email">
                        Email Address
                      </label>

                      <input
                        id="contact-email"
                        type="email"
                        value={contactEmail}
                        onChange={(event) =>
                          setContactEmail(
                            event.target.value
                          )
                        }
                        placeholder="Enter your email address"
                      />

                    </div>

                    <div className="password-form-field">

                      <label htmlFor="contact-subject">
                        Subject
                      </label>

                      <input
                        id="contact-subject"
                        type="text"
                        value={contactSubject}
                        onChange={(event) =>
                          setContactSubject(
                            event.target.value
                          )
                        }
                        placeholder="What would you like to contact us about?"
                      />

                    </div>

                    <div className="password-form-field">

                      <label htmlFor="contact-message">
                        Message
                      </label>

                      <textarea
                        id="contact-message"
                        value={contactMessage}
                        onChange={(event) =>
                          setContactMessage(
                            event.target.value
                          )
                        }
                        placeholder="Write your message here..."
                        rows={6}
                      />

                    </div>

                    {contactStatus && (
                      <p className="password-message">
                        {contactStatus}
                      </p>
                    )}

                    <button
                      type="button"
                      className="primary-button"
                      onClick={handleContactSubmit}
                      disabled={isSendingContact}
                    >
                      {isSendingContact
                        ? "Sending Message..."
                        : "Send Message"}
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* ==================================================
                ABOUT CAREER COPILOT
                ================================================== */}

            {activeSection === "about" && (
              <div className="settings-card about-career-card">

                <div className="settings-card-header">

                  <div>

                    <p className="settings-card-eyebrow">
                      ABOUT
                    </p>

                    <h2>
                      Career Copilot
                    </h2>

                    <p>
                      Your AI-powered career development
                      assistant.
                    </p>

                  </div>

                  <div className="about-version">
                    Version 1.0.0
                  </div>

                </div>

                <div className="settings-divider" />

                {/* Product Overview */}

                <div className="settings-section">

                  <h3>
                    What is Career Copilot?
                  </h3>

                  <p className="settings-description about-description">
                    Career Copilot is an AI-powered career
                    development platform designed to help
                    students and early-career professionals
                    understand their skills, discover suitable
                    career opportunities, identify skill gaps,
                    match their profiles with job descriptions,
                    and build personalized career roadmaps.
                  </p>

                </div>

                <div className="settings-divider" />

                {/* AI Capabilities */}

                <div className="settings-section">

                  <h3>
                    AI Capabilities
                  </h3>

                  <div className="about-feature-grid">

                    <div className="about-feature-item">

                      <span className="about-feature-icon">
                        📄
                      </span>

                      <div>
                        <strong>
                          Resume Analysis
                        </strong>

                        <p>
                          Extracts and analyzes resume
                          information to understand your
                          skills and experience.
                        </p>
                      </div>

                    </div>

                    <div className="about-feature-item">

                      <span className="about-feature-icon">
                        🎯
                      </span>

                      <div>
                        <strong>
                          Job Matching
                        </strong>

                        <p>
                          Compares your profile with job
                          descriptions to identify relevant
                          opportunities.
                        </p>
                      </div>

                    </div>

                    <div className="about-feature-item">

                      <span className="about-feature-icon">
                        🧩
                      </span>

                      <div>
                        <strong>
                          Skill Gap Detection
                        </strong>

                        <p>
                          Identifies missing skills and areas
                          that can improve your career readiness.
                        </p>
                      </div>

                    </div>

                    <div className="about-feature-item">

                      <span className="about-feature-icon">
                        🗺️
                      </span>

                      <div>
                        <strong>
                          Career Roadmaps
                        </strong>

                        <p>
                          Creates structured learning and
                          career development paths based
                          on your goals.
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                <div className="settings-divider" />

                {/* Technology Stack */}

                <div className="settings-section">

                  <h3>
                    Technology Stack
                  </h3>

                  <div className="about-tech-list">

                    <span>React</span>
                    <span>TypeScript</span>
                    <span>FastAPI</span>
                    <span>Python</span>
                    <span>Groq</span>
                    <span>PostgreSQL</span>
                    <span>SQLAlchemy</span>
                    <span>Resend</span>

                  </div>

                </div>

                <div className="settings-divider" />

                {/* Career Growth */}

                <div className="settings-section">

                  <h3>
                    Built for Career Growth
                  </h3>

                  <p className="settings-description about-description">
                    Career Copilot combines artificial
                    intelligence, structured career analysis,
                    and personalized recommendations to make
                    career planning more practical, accessible,
                    and actionable.
                  </p>

                </div>

                {/* Footer */}

                <div className="about-footer">

                  <span>
                    Career Copilot
                  </span>

                  <span>
                    AI-powered career development
                  </span>

                </div>

              </div>
            )}

            {/* ==================================================
                DANGER ZONE
                ================================================== */}

            {activeSection === "danger" && (
              <div className="settings-card">

                <div className="settings-card-header">

                  <div>

                    <p className="settings-card-eyebrow">
                      ACCOUNT MANAGEMENT
                    </p>

                    <h2>
                      Danger Zone
                    </h2>

                    <p>
                      Actions here can permanently affect
                      your Career Copilot account.
                    </p>

                  </div>

                </div>

                <div className="settings-divider" />

                <div className="settings-section">

                  <h3>
                    Delete Account
                  </h3>

                  <p className="settings-description">
                    Permanently delete your account and
                    associated Career Copilot data.
                    This action cannot be undone.
                  </p>

                  <button
                    type="button"
                    className="settings-danger-button"
                    onClick={() => {
                      setDeleteMessage("");
                      setDeletePassword("");
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete Account
                  </button>

                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* ======================================================
          DELETE ACCOUNT MODAL
          ====================================================== */}

      {showDeleteModal && (
        <div
          className="delete-modal-overlay"
          onClick={closeDeleteModal}
        >

          <div
            className="delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="delete-modal-icon">
              ⚠️
            </div>

            <p className="settings-card-eyebrow">
              PERMANENT ACTION
            </p>

            <h2>
              Delete Your Account?
            </h2>

            <p className="delete-modal-description">
              This will permanently delete your Career
              Copilot account and associated data.
              This action cannot be undone.
            </p>

            <div className="password-form-field">

              <label htmlFor="delete-account-password">
                Confirm with your current password
              </label>

              <input
                id="delete-account-password"
                type="password"
                value={deletePassword}
                onChange={(event) => {
                  setDeletePassword(
                    event.target.value
                  );
                  setDeleteMessage("");
                }}
                placeholder="Enter your current password"
                disabled={isDeletingAccount}
              />

            </div>

            {deleteMessage && (
              <p className="delete-message">
                {deleteMessage}
              </p>
            )}

            <div className="delete-modal-actions">

              <button
                type="button"
                className="settings-secondary-button"
                onClick={closeDeleteModal}
                disabled={isDeletingAccount}
              >
                Cancel
              </button>

              <button
                type="button"
                className="settings-danger-button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount
                  ? "Deleting Account..."
                  : "Delete Permanently"}
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

export default Settings;