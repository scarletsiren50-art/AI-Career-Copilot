import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuthProps = {
  onLoginSuccess: (user: {
    id: number;
    name: string;
    email: string;
  }) => void;
};

function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      // ============================================================
      // FORGOT PASSWORD
      // ============================================================

      if (isForgotPassword) {
        const response = await fetch(
          `${API_BASE_URL}/auth/forgot-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.detail ||
              "Unable to process your request. Please try again."
          );
          return;
        }

        setMessage(
          data.message ||
            "If an account with that email exists, a password reset link has been sent. Please check your inbox."
        );

        return;
      }

      // ============================================================
      // LOGIN / SIGN UP
      // ============================================================

      const endpoint = isLogin
        ? `${API_BASE_URL}/auth/login`
        : `${API_BASE_URL}/auth/signup`;

      const body = isLogin
        ? {
            email,
            password,
          }
        : {
            name,
            email,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // ============================================================
      // HANDLE FASTAPI VALIDATION ERRORS
      // ============================================================

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const validationMessage = data.detail
            .map((error: any) => {
              const field =
                error.loc?.[error.loc.length - 1];

              return `${
                field ? `${field}: ` : ""
              }${error.msg}`;
            })
            .join(" ");

          setMessage(validationMessage);
        } else {
          setMessage(
            data.detail ||
              data.message ||
              "Something went wrong. Please try again."
          );
        }

        return;
      }

      // ============================================================
      // LOGIN
      // ============================================================

      if (isLogin) {
        localStorage.setItem(
          "career_copilot_token",
          data.access_token
        );

        localStorage.setItem(
          "career_copilot_user",
          JSON.stringify(data.user)
        );

        setMessage("Login successful!");

        onLoginSuccess(data.user);
      }

      // ============================================================
      // SIGN UP
      // ============================================================

      else {
        setMessage("Account created successfully!");

        setIsLogin(true);

        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // RETURN TO LOGIN
  // ============================================================

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsLogin(true);
    setMessage("");
    setPassword("");
  };

  // ============================================================
  // FORGOT PASSWORD SCREEN
  // ============================================================

  if (isForgotPassword) {
    return (
      <section className="auth-section">
        <div className="auth-card">

          <div className="auth-header">
            <p className="section-eyebrow">
              PASSWORD RECOVERY
            </p>

            <h2>
              Forgot your password?
            </h2>

            <p>
              Enter your registered email and we'll
              send you a secure password reset link.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >

            <div className="auth-field">
              <label htmlFor="forgot-email">
                Email
              </label>

              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

          </form>

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <div className="auth-switch">
            <span>
              Remember your password?
            </span>

            <button
              type="button"
              onClick={handleBackToLogin}
            >
              Back to Log In
            </button>
          </div>

        </div>
      </section>
    );
  }

  // ============================================================
  // LOGIN / SIGN UP SCREEN
  // ============================================================

  return (
    <section className="auth-section">
      <div className="auth-card">

        <div className="auth-header">
          <p className="section-eyebrow">
            {isLogin
              ? "WELCOME BACK"
              : "GET STARTED"}
          </p>

          <h2>
            {isLogin
              ? "Log in to Career Copilot."
              : "Create your Career Copilot account."}
          </h2>

          <p>
            {isLogin
              ? "Continue building your career with AI-powered insights."
              : "Create an account to save and manage your career journey."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          {/* FORGOT PASSWORD */}

          {isLogin && (
            <div
              style={{
                textAlign: "right",
                marginTop: "-8px",
                marginBottom: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setMessage("");
                  setPassword("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Please wait..."
              : isLogin
              ? "Log In"
              : "Create Account"}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <div className="auth-switch">
          <span>
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              setPassword("");
            }}
          >
            {isLogin
              ? "Sign Up"
              : "Log In"}
          </button>
        </div>

      </div>
    </section>
  );
}

export default Auth;