const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  refreshToken,
c} = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const { ACCESS_SECRET } = require("../constants");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware(ACCESS_SECRET), getProfile);
router.post("/refresh-token", refreshToken);

module.exports = router;
