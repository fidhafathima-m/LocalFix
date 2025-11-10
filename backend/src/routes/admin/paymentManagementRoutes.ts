import { paymentManagementController } from "../../config/container";
import { Router } from "express";

const router = Router();

router.get("/", paymentManagementController.getPayments);
router.get("/stats", paymentManagementController.getPaymentStats);
router.get("/export", paymentManagementController.exportPayments);
router.get("/:id", paymentManagementController.getPaymentById);
router.post("/:id/refund", paymentManagementController.processRefund);

export default router;