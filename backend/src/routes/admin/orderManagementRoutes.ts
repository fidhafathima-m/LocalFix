import { Router } from "express";
import { orderManagementController } from "../../config/container";
import { admin } from "../../middleware/authMiddleware";

const router = Router();

router.get("/", orderManagementController.getOrders);
router.get("/stats", orderManagementController.getOrderStats);
router.get("/:orderId", orderManagementController.getOrderById);
router.patch("/:orderId/status", orderManagementController.updateOrderStatus);

export default router;