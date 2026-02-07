"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const createOrderRoutes = (orderController) => {
    const router = (0, express_1.Router)();
    // Order routes
    router.get("/", authMiddleware_1.protect, orderController.getUserOrders);
    router.get("/:orderId", authMiddleware_1.protect, orderController.getOrderById);
    router.get("/booking/:bookingId", authMiddleware_1.protect, orderController.getOrderByBookingId);
    router.patch("/:orderId/payment", authMiddleware_1.protect, orderController.updateOrderPayment);
    router.post("/:orderId/cancel", authMiddleware_1.protect, orderController.cancelOrder);
    router.post("/:orderId/reschedule", authMiddleware_1.protect, orderController.rescheduleOrder);
    router.post("/create-from-booking", authMiddleware_1.protect, orderController.createOrderFromBooking);
    return router;
};
exports.createOrderRoutes = createOrderRoutes;
exports.default = exports.createOrderRoutes;
