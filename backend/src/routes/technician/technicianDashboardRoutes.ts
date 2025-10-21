import { Router } from "express";
import { technicianDashboardController } from "../../config/container";
import { protect, serviceProvider } from "../../middleware/authMiddleware";

const router = Router();

router.use(protect);
router.use(serviceProvider);

// Dashboard routes
router.get(
  "/dashboard/overview",
  protect,
  technicianDashboardController.getDashboardOverview
);
// router.get('/dashboard/bookings/upcoming', technicianDashboardController.getUpcomingBookings);
// router.get('/dashboard/earnings/recent', technicianDashboardController.getRecentEarnings);
// router.get('/dashboard/reviews/recent', technicianDashboardController.getRecentReviews);
router.get(
  "/profile",
  protect,
  technicianDashboardController.getTechnicianProfile
);

export default router;
