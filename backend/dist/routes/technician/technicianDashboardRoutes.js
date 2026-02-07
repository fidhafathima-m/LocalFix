"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../../config/container");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.use(authMiddleware_1.serviceProvider);
// Dashboard routes
router.get("/dashboard/overview", authMiddleware_1.protect, container_1.technicianDashboardController.getDashboardOverview);
// router.get('/dashboard/bookings/upcoming', technicianDashboardController.getUpcomingBookings);
// router.get('/dashboard/earnings/recent', technicianDashboardController.getRecentEarnings);
// router.get('/dashboard/reviews/recent', technicianDashboardController.getRecentReviews);
router.get("/profile", authMiddleware_1.protect, container_1.technicianDashboardController.getTechnicianProfile);
exports.default = router;
