"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../../config/container");
const router = (0, express_1.Router)();
// Dashboard routes
router.get('/overview', container_1.dashboardController.getDashboardOverview);
router.get('/revenue-trend', container_1.dashboardController.getRevenueTrend);
router.get('/top-technicians', container_1.dashboardController.getTopTechnicians);
router.get('/customer-satisfaction', container_1.dashboardController.getCustomerSatisfaction);
router.get('/payment-methods', container_1.dashboardController.getPaymentMethods);
router.get('/growth-metrics', container_1.dashboardController.getGrowthMetrics);
router.get('/complete', container_1.dashboardController.getCompleteDashboard);
router.post('/generate', container_1.reportController.generateReport);
router.post('/financial', container_1.reportController.generateFinancialReport);
router.post('/customer', container_1.reportController.generateCustomerReport);
router.post('/technician', container_1.reportController.generateTechnicianReport);
router.post('/export', container_1.reportController.exportReport);
exports.default = router;
