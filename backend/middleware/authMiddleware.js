const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    try {
        // Get authorization header
        const authHeader = req.headers.authorization;

        // Check whether token exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access token is required"
            });
        }

        // Expected format:
        // Authorization: Bearer <token>
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store decoded information in request
        req.user = decoded;

        // Continue to the next middleware/route
        next();

    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticateToken;