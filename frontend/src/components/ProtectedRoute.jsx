import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRoles, children }) {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Not logged in
    if (!token || !userData) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userData);

    // Logged in, but wrong role
    if (!allowedRoles.includes(user.role)) {
        if (user.role === "ADMIN") {
            return <Navigate to="/admin" replace />;
        }

        if (user.role === "OWNER") {
            return <Navigate to="/owner" replace />;
        }

        return <Navigate to="/user" replace />;
    }

    return children;
}

export default ProtectedRoute;