const express = require("express");
const { signup, login, updatePassword, updatePasswordPublic } = require("../controllers/authController");
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

// Public endpoint to change password before login
router.put("/password/public", updatePasswordPublic);

module.exports = router;
