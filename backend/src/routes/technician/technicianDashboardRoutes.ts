// routes/technicianDashboardRoutes.ts
import { Router } from 'express';
import TechnicianDashboardController from '../../controllers/technician/technicianDashboard';
import { protect, serviceProvider } from '../../middleware/authMiddleware'; // Import both

const router = Router();

// All routes require authentication AND service provider role
router.use(protect); // First verify authentication
router.use(serviceProvider); // Then verify service provider role

// Dashboard routes
router.get('/dashboard/overview', TechnicianDashboardController.getDashboardOverview);
// router.get('/dashboard/bookings/upcoming', TechnicianDashboardController.getUpcomingBookings);
// router.get('/dashboard/earnings/recent', TechnicianDashboardController.getRecentEarnings);
// router.get('/dashboard/reviews/recent', TechnicianDashboardController.getRecentReviews);
router.get('/profile', TechnicianDashboardController.getTechnicianProfile);

export default router;