import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const userData = localStorage.getItem("user");

    let user = null;

    if (userData) {
        try {
            user = JSON.parse(userData);
        } catch (error) {
            console.error("Invalid user data:", error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const goToDashboard = () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role === "ADMIN") {
            navigate("/admin");
        } else if (user.role === "OWNER") {
            navigate("/owner");
        } else {
            navigate("/user");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                Store Rating App
            </div>

            {user && (
                <div className="navbar-user">
                    <span className="navbar-user-name">
                        {user.name} ({user.role})
                    </span>

                    <button
                        className="navbar-btn"
                        type="button"
                        onClick={goToDashboard}
                    >
                        Dashboard
                    </button>

                    {(user.role === "USER" ||
                        user.role === "OWNER") && (
                        <button
                            className="navbar-btn"
                            type="button"
                            onClick={() =>
                                navigate("/change-password")
                            }
                        >
                            Change Password
                        </button>
                    )}

                    <button
                        className="navbar-btn"
                        type="button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}

export default Navbar;