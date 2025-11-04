import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { paymentController } from "../../config/container";

const router = Router();

// Payment routes
router.post("/create-order", protect, paymentController.createPaymentOrder);
router.post("/verify", protect, paymentController.verifyPayment);

export default router;