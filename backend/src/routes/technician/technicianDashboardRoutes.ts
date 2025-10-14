import { Router } from "express";
import TechnicianDashboardController from "../../controllers/technician/technicianDashboard";
import { protect, serviceProvider } from "../../middleware/authMiddleware";

const router = Router();

router.use(protect);
router.use(serviceProvider);

// Dashboard routes
router.get(
  "/dashboard/overview", protect,
  TechnicianDashboardController.getDashboardOverview
);
// router.get('/dashboard/bookings/upcoming', TechnicianDashboardController.getUpcomingBookings);
// router.get('/dashboard/earnings/recent', TechnicianDashboardController.getRecentEarnings);
// router.get('/dashboard/reviews/recent', TechnicianDashboardController.getRecentReviews);
router.get("/profile", protect, TechnicianDashboardController.getTechnicianProfile);

export default router;
