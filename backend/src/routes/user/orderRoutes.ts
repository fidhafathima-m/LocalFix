import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { orderController } from "../../config/container";

const router = Router();

// Order routes
router.get("/", protect, orderController.getUserOrders);
router.get("/:orderId", protect, orderController.getOrderById);
router.post("/:orderId/cancel", protect, orderController.cancelOrder);
router.post(
  "/create-from-booking",
  protect,
  orderController.createOrderFromBooking
);

export default router;
