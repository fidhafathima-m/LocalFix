import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { orderController } from "../../config/container";

const router = Router();

// Order routes
router.get("/", protect, orderController.getUserOrders);
router.get("/:orderId", protect, orderController.getOrderById);
router.get("/booking/:bookingId", protect, orderController.getOrderByBookingId);
router.patch("/:orderId/payment", protect, orderController.updateOrderPayment);
router.post("/:orderId/cancel", protect, orderController.cancelOrder);
router.post("/:orderId/reschedule", protect, orderController.rescheduleOrder);
router.post(
  "/create-from-booking",
  protect,
  orderController.createOrderFromBooking
);

export default router;
