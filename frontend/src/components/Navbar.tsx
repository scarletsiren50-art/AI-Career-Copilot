import { useState } from "react";

type NavbarProps = {
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;

  onLogout?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onDashboard?: () => void;
  onCareerCopilot?: () => void;
  onFeatures?: () => void;
  onHowItWorks?: () => void;
};

function Navbar({
  user,
  onLogout,
  onProfile,
  onSettings,
  onDashboard,
  onCareerCopilot,
  onFeatures,
  onHowItWorks,
}: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] =
    useState(false);

  const handleDashboardClick = () => {
    setIsProfileOpen(false);
    onDashboard?.();
  };

  const handleCareerCopilotClick = () => {
    setIsProfileOpen(false);
    onCareerCopilot?.();
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div
        className="navbar-logo"
        onClick={
          user
            ? handleCareerCopilotClick
            : undefined
        }
        role={user ? "button" : undefined}
        tabIndex={user ? 0 : undefined}
      >
        <h2>Career Copilot</h2>
      </div>

      <div className="navbar-links">

        {/* Logged-in navigation */}
        {user && (
          <>
            <button
              type="button"
              className="navbar-nav-button"
              onClick={handleDashboardClick}
            >
              Dashboard
            </button>

            <button
              type="button"
              className="navbar-nav-button"
              onClick={handleCareerCopilotClick}
            >
              Career Copilot
            </button>
          </>
        )}

        {/* Public navigation */}
        <button 
          type="button"
          className="navbar-nav-button"
          onClick={onFeatures}
        >
          Features
        </button>

        <button
          type="button"
          className="navbar-nav-button"
          onClick={onHowItWorks}
        >
          How It Works
        </button>

        <a
          href="#resume-upload"
          className="navbar-button"
        >
          Get Started
        </a>

        {/* Profile */}
        {user && (
          <div className="navbar-profile">

            <button
              type="button"
              className="profile-trigger"
              onClick={() =>
                setIsProfileOpen(
                  !isProfileOpen
                )
              }
              aria-label="Open profile menu"
              aria-expanded={isProfileOpen}
            >
              <div className="profile-avatar">
                {user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <span className="profile-arrow">
                {isProfileOpen
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown">

                {/* User information */}
                <div className="profile-dropdown-header">

                  <div className="profile-avatar profile-avatar-large">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="profile-user-info">
                    <strong>
                      {user.name}
                    </strong>

                    <span>
                      {user.email}
                    </span>
                  </div>

                </div>

                <div className="profile-divider" />

                {/* Dashboard */}
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onDashboard?.();
                  }}
                >
                  <span className="profile-menu-icon">
                    🏠
                  </span>

                  <span>
                    Dashboard
                  </span>
                </button>

                {/* Career Copilot */}
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onCareerCopilot?.();
                  }}
                >
                  <span className="profile-menu-icon">
                    🚀
                  </span>

                  <span>
                    Career Copilot
                  </span>
                </button>

                {/* Profile */}
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onProfile?.();
                  }}
                >
                  <span className="profile-menu-icon">
                    👤
                  </span>

                  <span>
                    Profile
                  </span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onSettings?.();
                  }}
                >
                  <span className="profile-menu-icon">
                    ⚙
                  </span>

                  <span>
                    Settings
                  </span>
                </button>

                {/* Logout */}
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout?.();
                  }}
                >
                  <span className="profile-menu-icon">
                    🚪
                  </span>

                  <span>
                    Logout
                  </span>
                </button>

                <div className="profile-divider" />

                {/* Delete Account */}
                <button
                  type="button"
                  className="profile-menu-item profile-delete-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Delete account is handled from Settings.
                    onSettings?.();
                  }}
                >
                  <span className="profile-menu-icon">
                    ⚠
                  </span>

                  <span>
                    Delete Account
                  </span>
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;