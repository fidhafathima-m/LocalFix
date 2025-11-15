import { Router } from 'express';
import { dashboardController, reportController } from '../../config/container';

const router = Router();

// Dashboard routes
router.get('/overview', dashboardController.getDashboardOverview);
router.get('/revenue-trend', dashboardController.getRevenueTrend);
router.get('/top-technicians', dashboardController.getTopTechnicians);
router.get(
  '/customer-satisfaction',
  dashboardController.getCustomerSatisfaction
);
router.get('/payment-methods', dashboardController.getPaymentMethods);
router.get('/growth-metrics', dashboardController.getGrowthMetrics);
router.get('/complete', dashboardController.getCompleteDashboard);

router.post('/generate', reportController.generateReport);
router.post('/financial', reportController.generateFinancialReport);
router.post('/customer', reportController.generateCustomerReport);
router.post('/technician', reportController.generateTechnicianReport);
router.post('/export', reportController.exportReport);

export default router;
