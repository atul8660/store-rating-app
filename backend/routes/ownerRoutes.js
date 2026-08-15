const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getDashboard
} = require("../controllers/ownerController");

const router = express.Router();

router.get(
    "/dashboard",
    authenticateToken,
    authorizeRoles("OWNER"),
    getDashboard
);

module.exports = router;