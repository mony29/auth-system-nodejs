import express from "express";
const router = express.Router();
import {
  register,
  login,
  getProfile,
  refreshToken,
  sendCode,
  verifyCodeAndRegister,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";
import { ACCESS_SECRET } from "../constants.js";

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware(ACCESS_SECRET), getProfile);
router.post("/refresh-token", refreshToken);

/** register by send code verification */
router.post("/register/send-code", sendCode);
router.post("/register/verify-code", verifyCodeAndRegister);
export default router;
