import { Router } from "express";
import { authController } from "../config/container";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOtp);
router.post("/verify-reset-otp", authController.verifyResetOtp);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-otp", authController.resendOTP);
router.post("/google", authController.googleAuth);
router.post("/facebook", authController.facebookLogin);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", protect, authController.logout);

export default router;
