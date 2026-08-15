const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const {
    isValidPassword,
    isValidEmail
} = require("../utils/validation");

const getDashboardStats = async (req, res) => {
    try {
        const [userResult] = await pool.query(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        const [storeResult] = await pool.query(
            "SELECT COUNT(*) AS totalStores FROM stores"
        );

        const [ratingResult] = await pool.query(
            "SELECT COUNT(*) AS totalRatings FROM ratings"
        );

        res.status(200).json({
            success: true,
            data: {
                totalUsers: userResult[0].totalUsers,
                totalStores: storeResult[0].totalStores,
                totalRatings: ratingResult[0].totalRatings
            }
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};

const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            address,
            role
        } = req.body;

        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters"
            });
        }

        if (address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address must not exceed 400 characters"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        if (!["USER", "ADMIN", "OWNER"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be USER, ADMIN or OWNER"
            });
        }

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, address, role]
        );

        res.status(201).json({
            success: true,
            message: `${role} created successfully`,
            userId: result.insertId
        });
    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
};

const createStore = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            ownerId
        } = req.body;

        if (!name || !email || !address) {
            return res.status(400).json({
                success: false,
                message: "Name, email and address are required"
            });
        }

        if (name.length > 255) {
            return res.status(400).json({
                success: false,
                message: "Store name is too long"
            });
        }

        if (address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address must not exceed 400 characters"
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        const [existingStores] = await pool.query(
            "SELECT id FROM stores WHERE email = ?",
            [email]
        );

        if (existingStores.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Store email is already registered"
            });
        }

        if (ownerId) {
            const [owners] = await pool.query(
                "SELECT id, role FROM users WHERE id = ?",
                [ownerId]
            );

            if (owners.length === 0 || owners[0].role !== "OWNER") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid store owner"
                });
            }
        }

        const [result] = await pool.query(
            `INSERT INTO stores
            (name, email, address, owner_id)
            VALUES (?, ?, ?, ?)`,
            [name, email, address, ownerId || null]
        );

        res.status(201).json({
            success: true,
            message: "Store created successfully",
            storeId: result.insertId
        });
    } catch (error) {
        console.error("Create store error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create store"
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            role,
            sortBy = "name",
            order = "ASC"
        } = req.query;

        let query = `
            SELECT id, name, email, address, role
            FROM users
            WHERE 1 = 1
        `;

        const values = [];

        // Filters
        if (name) {
            query += " AND name LIKE ?";
            values.push(`%${name}%`);
        }

        if (email) {
            query += " AND email LIKE ?";
            values.push(`%${email}%`);
        }

        if (address) {
            query += " AND address LIKE ?";
            values.push(`%${address}%`);
        }

        if (role) {
            if (!["USER", "ADMIN", "OWNER"].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid role filter"
                });
            }

            query += " AND role = ?";
            values.push(role);
        }

        // Allowed sorting columns
        const allowedSortFields = {
            name: "name",
            email: "email",
            address: "address",
            role: "role"
        };

        const selectedSort =
            allowedSortFields[sortBy] || "name";

        const selectedOrder =
            order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        query += ` ORDER BY ${selectedSort} ${selectedOrder}`;

        const [users] = await pool.query(query, values);

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

const getStores = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            sortBy = "name",
            order = "ASC"
        } = req.query;

        let query = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(AVG(r.rating), 0) AS rating
            FROM stores s
            LEFT JOIN ratings r
                ON s.id = r.store_id
            WHERE 1 = 1
        `;

        const values = [];

        if (name) {
            query += " AND s.name LIKE ?";
            values.push(`%${name}%`);
        }

        if (email) {
            query += " AND s.email LIKE ?";
            values.push(`%${email}%`);
        }

        if (address) {
            query += " AND s.address LIKE ?";
            values.push(`%${address}%`);
        }

        const allowedSortFields = {
            name: "s.name",
            email: "s.email",
            address: "s.address",
            rating: "rating"
        };

        const selectedSort =
            allowedSortFields[sortBy] || "s.name";

        const selectedOrder =
            order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        query += `
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address
            ORDER BY ${selectedSort} ${selectedOrder}
        `;

        const [stores] = await pool.query(query, values);

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stores"
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.query(
            `SELECT id, name, email, address, role
             FROM users
             WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        let stores = [];

        if (user.role === "OWNER") {
            const [ownerStores] = await pool.query(
                `SELECT
                    s.id,
                    s.name,
                    s.email,
                    s.address,
                    COALESCE(AVG(r.rating), 0) AS rating
                 FROM stores s
                 LEFT JOIN ratings r
                    ON s.id = r.store_id
                 WHERE s.owner_id = ?
                 GROUP BY
                    s.id,
                    s.name,
                    s.email,
                    s.address`,
                [id]
            );

            stores = ownerStores;
        }

        res.status(200).json({
            success: true,
            user,
            stores
        });

    } catch (error) {
        console.error("Get user details error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user details"
        });
    }
};

module.exports = {
    getDashboardStats,
    createUser,
    createStore,
    getUsers,
    getStores,
    getUserDetails
};