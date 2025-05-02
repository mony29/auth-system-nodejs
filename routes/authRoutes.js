const express = require("express");
const router = express.Router();
const { register, login, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const { SECRET } = require("../config");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware(SECRET), getProfile);

module.exports = router;
