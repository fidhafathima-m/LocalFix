import { Router } from 'express';
import AuthController from '../controllers/user/authController';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/verify-reset-otp', AuthController.verifyResetOtp); // New route
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/resend-otp', AuthController.resendOTP); // New route
router.post('/google', AuthController.googleAuth);
router.post('/facebook', AuthController.facebookLogin); // New route

export default router;