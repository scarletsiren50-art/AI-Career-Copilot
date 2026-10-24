import { useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type ProfileProps = {
  user: User;
  onBack: () => void;
  onUserUpdated: (updatedUser: User) => void;
};

function Profile({
  user,
  onBack,
  onUserUpdated,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleCancel = () => {
    setName(user.name);
    setMessage("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("career_copilot_token");
      
      if (!token) {
        setMessage("Not authenticated. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Unable to update your profile."
        );
        return;
      }

      const updatedUser = data.user;

      // Update App state
      onUserUpdated(updatedUser);

      // Keep localStorage in sync
      localStorage.setItem(
        "career_copilot_user",
        JSON.stringify(updatedUser)
      );

      setName(updatedUser.name);
      setMessage("Profile updated successfully!");
      setIsEditing(false);

    } catch (error) {
      console.error("Profile update error:", error);

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-page-container">

        <button
          type="button"
          className="profile-back-button"
          onClick={onBack}
        >
          ← Back to Career Copilot
        </button>

        <div className="profile-page-header">
          <p className="section-eyebrow">
            ACCOUNT
          </p>

          <h1>Your Profile</h1>

          <p>
            Manage your personal information and account details.
          </p>
        </div>

        <div className="profile-page-card">

          {/* Profile Header */}
          <div className="profile-picture-section">

            <div className="profile-page-avatar">
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{name}</h2>

              <p>{user.email}</p>

              <button
                type="button"
                className="profile-photo-button"
              >
                Change Profile Picture
              </button>
            </div>

          </div>

          <div className="profile-divider-large" />

          {/* Profile Information */}
          <div className="profile-information">

            <div className="profile-field">
              <label htmlFor="profile-name">
                Full Name
              </label>

              {isEditing ? (
                <input
                  id="profile-name"
                  type="text"
                  className="profile-edit-input"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="profile-value">
                  {user.name}
                </div>
              )}
            </div>

            <div className="profile-field">
              <label>
                Email Address
              </label>

              <div className="profile-value profile-readonly">
                {user.email}
              </div>

              {isEditing && (
                <span className="profile-field-note">
                  Email changes will be handled separately
                  through Account & Security.
                </span>
              )}
            </div>

            <div className="profile-field">
              <label>
                Account ID
              </label>

              <div className="profile-value">
                #{user.id}
              </div>
            </div>

          </div>

          {/* Success / Error Message */}
          {message && (
            <p className="profile-message">
              {message}
            </p>
          )}

          {/* Action Buttons */}
          <div className="profile-actions">

            {isEditing ? (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSave}
                  disabled={!name.trim() || isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={onBack}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setMessage("");
                    setIsEditing(true);
                  }}
                >
                  Edit Profile
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

export default Profile;