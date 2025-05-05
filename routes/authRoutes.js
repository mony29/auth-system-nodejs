import express from "express";
const router = express.Router();
import {
  register,
  login,
  getProfile,
  refreshToken,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";
import { ACCESS_SECRET } from "../constants.js";

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware(ACCESS_SECRET), getProfile);
router.post("/refresh-token", refreshToken);

export default router;
