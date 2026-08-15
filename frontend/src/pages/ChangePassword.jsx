import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await api.put(
                "/auth/password",
                {
                    currentPassword,
                    newPassword
                }
            );

            setMessage(response.data.message);

            setCurrentPassword("");
            setNewPassword("");
        } catch (error) {
            console.error("Password update error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to update password"
            );
        }
    };

    return (
        <div>
            <Navbar />

            <main className="dashboard-page">
                <section className="section">
                    <h1 className="page-title">
                        Change Password
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="currentPassword">
                                    Current Password
                                </label>

                                <input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) =>
                                        setCurrentPassword(
                                            event.target.value
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">
                                    New Password
                                </label>

                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(
                                            event.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                className="btn btn-primary"
                                type="submit"
                            >
                                Update Password
                            </button>
                        </div>
                    </form>

                    {message && (
                        <div className="message message-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="message message-error">
                            {error}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default ChangePassword;