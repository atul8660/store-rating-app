import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const validateForm = () => {
        const {
            name,
            email,
            address,
            password
        } = formData;

        if (name.length < 20 || name.length > 60) {
            return "Name must be between 20 and 60 characters";
        }

        if (address.length > 400) {
            return "Address must not exceed 400 characters";
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return "Please enter a valid email";
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return "Password must be 8-16 characters and contain at least one uppercase letter and one special character";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/signup",
                formData
            );

            setMessage(response.data.message);

            setFormData({
                name: "",
                email: "",
                address: "",
                password: ""
            });

        } catch (error) {
            console.error("Signup error:", error);

            setError(
                error.response?.data?.message ||
                "Signup failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="dashboard-page">
            <section
                className="section"
                style={{
                    maxWidth: "600px",
                    margin: "60px auto"
                }}
            >
                <h1 className="page-title">
                    Create Account
                </h1>

                <p style={{ marginBottom: "20px" }}>
                    Register as a normal user
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">
                            Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <br />

                    <div className="form-group">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <br />

                    <div className="form-group">
                        <label htmlFor="address">
                            Address
                        </label>

                        <input
                            id="address"
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
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
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
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
                                ? "Creating..."
                                : "Create Account"}
                        </button>

                        <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Back to Login
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
    );
}

export default Signup;