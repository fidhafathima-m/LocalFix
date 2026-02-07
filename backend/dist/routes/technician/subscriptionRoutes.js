"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../../config/container");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes for technicians to view available subscription plans
router.get('/current', authMiddleware_1.protect, container_1.technicianSubscriptionController.getCurrentSubscription);
router.get('/history', authMiddleware_1.protect, container_1.technicianSubscriptionController.getSubscriptionHistory);
router.get('/purchase/:purchaseId', authMiddleware_1.protect, container_1.technicianSubscriptionController.getSubscriptionPurchaseById);
router.get('/', container_1.technicianSubscriptionController.getActiveSubscriptions);
router.get('/:id', container_1.technicianSubscriptionController.getSubscriptionById);
router.get('/slug/:slug', container_1.technicianSubscriptionController.getSubscriptionBySlug);
router.post('/:id/payment/razorpay-order', authMiddleware_1.protect, container_1.technicianSubscriptionController.createRazorpayOrder);
router.post('/:id/payment/wallet', authMiddleware_1.protect, container_1.technicianSubscriptionController.processWalletPayment);
router.post('/payment/verify', authMiddleware_1.protect, container_1.technicianSubscriptionController.verifyPayment);
exports.default = router;
