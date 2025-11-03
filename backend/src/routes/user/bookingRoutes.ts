import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { bookingController } from "../../config/container";

const router = Router();

// Booking routes
router.post("/", protect, bookingController.createBooking);
router.get("/user", protect, bookingController.getUserBookings);
router.get("/:bookingId", protect, bookingController.getBookingById);
router.post("/:bookingId/cancel", protect, bookingController.cancelBooking);
router.patch("/:bookingId/status", protect, bookingController.updateBookingStatus);

export default router;