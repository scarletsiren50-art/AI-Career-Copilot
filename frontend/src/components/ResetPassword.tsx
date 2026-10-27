import { useState } from "react";

type ResetPasswordProps = {
    onBackToLogin: () => void;
};

function ResetPassword({
    onBackToLogin,
}: ResetPasswordProps) {

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [isResetting, setIsResetting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    const token = new URLSearchParams(
        window.location.search
    ).get("token");

    const handleResetPassword = async (
        event: React.FormEvent
    ) => {

        event.preventDefault();

        setMessage("");
        setError("");

        if (!token) {
            setError(
                "This password reset link is invalid."
            );
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters long."
            );
            return;
        }

        if (password.length > 72) {
            setError(
                "Password must not exceed 72 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        setIsResetting(true);

        try {

            const response = await fetch(
                `${API_BASE_URL}/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        token,
                        new_password: password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.detail ||
                    "Unable to reset your password."
                );
                return;
            }

            setResetSuccess(true);

            setMessage(
                "Your password has been reset successfully."
            );

            setPassword("");
            setConfirmPassword("");

        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );

            setError(
                "Unable to connect to the server. Please try again."
            );

        } finally {

            setIsResetting(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <p className="section-eyebrow">
                        CAREER COPILOT
                    </p>

                    <h1>
                        Reset Your Password
                    </h1>

                    {!resetSuccess && (
                        <p>
                            Create a new password for your account.
                        </p>
                    )}

                </div>

                {resetSuccess ? (

                    <div className="auth-form">

                        <div className="upload-result">
                            <strong>
                                ✓ Password reset successful
                            </strong>

                            <span>
                                You can now sign in using your
                                new password.
                            </span>
                        </div>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={onBackToLogin}
                        >
                            Back to Sign In
                        </button>

                    </div>

                ) : (

                    <form
                        className="auth-form"
                        onSubmit={handleResetPassword}
                    >

                        <div className="auth-input-group">

                            <label htmlFor="new-password">
                                New Password
                            </label>

                            <input
                                id="new-password"
                                type="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                required
                            />

                        </div>

                        <div className="auth-input-group">

                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                required
                            />

                        </div>

                        <p
                            style={{
                                fontSize: "13px",
                                color: "var(--muted)",
                                marginTop: "-5px",
                            }}
                        >
                            Password must be 8–72 characters.
                        </p>

                        {error && (
                            <p
                                style={{
                                    color: "#ff8a8a",
                                    fontSize: "14px",
                                }}
                            >
                                {error}
                            </p>
                        )}

                        {message && (
                            <p
                                style={{
                                    color: "var(--primary)",
                                    fontSize: "14px",
                                }}
                            >
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={isResetting}
                        >
                            {isResetting
                                ? "Resetting Password..."
                                : "Reset Password"}
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onBackToLogin}
                        >
                            Back to Sign In
                        </button>

                    </form>

                )}

            </div>

        </div>
    );
}

export default ResetPassword;