import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            if (user.role === "ADMIN") {
                navigate("/admin");
            } else if (user.role === "OWNER") {
                navigate("/owner");
            } else {
                navigate("/user");
            }
        } catch (error) {
            console.error("Login error:", error);

            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <main className="dashboard-page">
                <section
                    className="section"
                    style={{
                        maxWidth: "500px",
                        margin: "80px auto"
                    }}
                >
                    <h1 className="page-title">
                        Store Rating App
                    </h1>

                    <p style={{ marginBottom: "20px" }}>
                        Sign in to continue
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <br />

                        <div className="form-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Login"}
                            </button>
                        </div>
                    </form>

                    {message && (
                        <div className="message message-error">
                            {message}
                        </div>
                    )}

                    {/* Signup option */}
                    <div style={{ marginTop: "20px" }}>
                        <span>
                            Don't have an account?{" "}
                        </span>

                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() =>
                                navigate("/signup")
                            }
                        >
                            Sign Up
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Login;