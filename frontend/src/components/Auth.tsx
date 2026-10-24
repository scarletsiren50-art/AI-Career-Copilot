import { useState } from "react";

type AuthProps = {
  onLoginSuccess: (user: {
    id: number;
    name: string;
    email: string;
  }) => void;
};

function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);

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
      const endpoint = isLogin
        ? "http://127.0.0.1:8000/auth/login"
        : "http://127.0.0.1:8000/auth/signup";

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

      /*
       * Handle FastAPI validation errors.
       */
      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const validationMessage = data.detail
            .map((error: any) => {
              const field =
                error.loc?.[error.loc.length - 1];

              return `${field ? `${field}: ` : ""}${error.msg}`;
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

      /*
       * LOGIN
       *
       * Store both:
       * 1. User information
       * 2. JWT access token
       */
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
      } else {
        /*
         * SIGN UP
         */
        setMessage("Account created successfully!");

        setIsLogin(true);

        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">

        <div className="auth-header">
          <p className="section-eyebrow">
            {isLogin ? "WELCOME BACK" : "GET STARTED"}
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