const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getStores,
    submitRating,
    updateRating
} = require("../controllers/userController");

const router = express.Router();

router.get(
    "/stores",
    authenticateToken,
    authorizeRoles("USER"),
    getStores
);

router.post(
    "/ratings",
    authenticateToken,
    authorizeRoles("USER"),
    submitRating
);

router.put(
    "/ratings/:storeId",
    authenticateToken,
    authorizeRoles("USER"),
    updateRating
);

module.exports = router;