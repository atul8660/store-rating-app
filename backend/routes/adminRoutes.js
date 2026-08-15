const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getDashboardStats,
    createUser,
    createStore,
    getUsers,
    getStores,
    getUserDetails
} = require("../controllers/adminControllers");

const router = express.Router();

router.get(
    "/dashboard",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getDashboardStats
);

router.post(
    "/users",
    authenticateToken,
    authorizeRoles("ADMIN"),
    createUser
);

router.post(
    "/stores",
    authenticateToken,
    authorizeRoles("ADMIN"),
    createStore
);

router.get(
    "/users",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getUsers
);

router.get(
    "/stores",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getStores
);

router.get(
    "/users/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getUserDetails
);

module.exports = router;