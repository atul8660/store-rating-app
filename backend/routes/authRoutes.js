const express = require("express");
const { signup, login, updatePassword } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.put(
    "/password",
    authenticateToken,
    authorizeRoles("USER", "OWNER"),
    updatePassword
);

module.exports = router;
