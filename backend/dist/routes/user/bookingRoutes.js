"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const createBookingRoutes = (bookingController) => {
    const router = (0, express_1.Router)();
    // Booking routes
    router.post("/", authMiddleware_1.protect, bookingController.createBooking);
    router.get("/user", authMiddleware_1.protect, bookingController.getUserBookings);
    router.get("/:bookingId", authMiddleware_1.protect, bookingController.getBookingById);
    router.post("/:bookingId/cancel", authMiddleware_1.protect, bookingController.cancelBooking);
    router.put("/:bookingId", authMiddleware_1.protect, bookingController.updateBooking);
    router.patch("/:bookingId/status", authMiddleware_1.protect, bookingController.updateBookingStatus);
    router.get("/:bookingId/tracking", authMiddleware_1.protect, bookingController.getTrackingDetails);
    router.get("/:bookingId/technician-location", authMiddleware_1.protect, bookingController.getTechnicianLocation);
    return router;
};
exports.createBookingRoutes = createBookingRoutes;
exports.default = exports.createBookingRoutes;
