import express from 'express';
import {
  technicianLogin,
  technicianForgotPassword,
  technicianResetPassword,
  verifyTechnicianResetOtp,
} from '../../controllers/auth/technicianAuth';

const router = express.Router();

router.post('/login', technicianLogin);
router.post('/forgot-password', technicianForgotPassword);
router.post('/verify-reset-otp', verifyTechnicianResetOtp);
router.post('/reset-password', technicianResetPassword);

export default router;
