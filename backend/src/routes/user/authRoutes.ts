import express from 'express';
import { forgotPassword, login, resetPassword, signup, verifyOtp } from '../../controllers/user/authController';

const router = express.Router();
router.post('/signup', signup);
router.post('/verify-otp', verifyOtp)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router