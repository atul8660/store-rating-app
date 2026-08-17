import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ChangePasswordPublic() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const validateEmail = (e) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(e);
    };

    const validateNewPassword = (p) => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
        return passwordRegex.test(p);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!email || !currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Invalid email format");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Confirm password must match the new password");
            return;
        }

        if (!validateNewPassword(newPassword)) {
            setError("New password must be 8-16 characters and contain at least one uppercase letter and one special character");
            return;
        }

        try {
            const response = await api.put("/auth/password/public", {
                email,
                currentPassword,
                newPassword
            });

            setMessage(response.data.message);

            // clear fields
            setEmail("");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // navigate back to login after a short delay
            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            console.error("Public change password error:", err);
            setError(
                err.response?.data?.message ||
                "Failed to change password"
            );
        }
    };

    return (
        <main className="dashboard-page">
            <section className="section" style={{ maxWidth: "500px", margin: "80px auto" }}>
                <h1 className="page-title">Change Password</h1>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <br />

                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-primary" type="submit">
                            Change Password
                        </button>
                    </div>
                </form>

                {message && <div className="message message-success">{message}</div>}
                {error && <div className="message message-error">{error}</div>}

            </section>
        </main>
    );
}

export default ChangePasswordPublic;
