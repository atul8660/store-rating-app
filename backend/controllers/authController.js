const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

/*
==================================================
SIGNUP
POST /api/auth/signup
==================================================
*/
const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            password
        } = req.body;

        // ==========================================
        // Required fields
        // ==========================================

        if (!name || !email || !address || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // ==========================================
        // Name validation
        // Challenge: 20-60 characters
        // ==========================================

        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters"
            });
        }

        // ==========================================
        // Address validation
        // Challenge: maximum 400 characters
        // ==========================================

        if (address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address must not exceed 400 characters"
            });
        }

        // ==========================================
        // Email validation
        // ==========================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // ==========================================
        // Password validation
        // Challenge:
        // 8-16 characters
        // at least one uppercase
        // at least one special character
        // ==========================================

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // ==========================================
        // Check duplicate email
        // ==========================================

        const [existingUsers] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // ==========================================
        // Hash password
        // ==========================================

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // ==========================================
        // Create normal user
        // Public signup always creates USER
        // ==========================================

        const [result] = await pool.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, 'USER')`,
            [
                name,
                email,
                hashedPassword,
                address
            ]
        );

        res.status(201).json({
            success: true,
            message: "USER registered successfully",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during signup"
        });
    }
};


/*
==================================================
LOGIN
POST /api/auth/login
==================================================
*/
const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Compare password
        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};


/*
==================================================
UPDATE PASSWORD
PUT /api/auth/password
==================================================
*/
const updatePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        // Get logged-in user from JWT
        const userId = req.user.userId;

        // Required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // Get stored password
        const [users] = await pool.query(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare current password
        const isPasswordValid =
            await bcrypt.compare(
                currentPassword,
                users[0].password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        // Update password
        await pool.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [
                hashedPassword,
                userId
            ]
        );

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error(
            "Update password error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update password"
        });
    }
};


module.exports = {
    signup,
    login,
    updatePassword
};