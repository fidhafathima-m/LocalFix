"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const container_1 = require("../../config/container");
const router = (0, express_1.Router)();
// Payment routes
router.post('/create-order', authMiddleware_1.protect, container_1.paymentController.createPaymentOrder);
router.post('/verify', authMiddleware_1.protect, container_1.paymentController.verifyPayment);
router.post('/wallet/pay', authMiddleware_1.protect, container_1.paymentController.processWalletPayment.bind(container_1.paymentController));
router.post('/wallet/refund', authMiddleware_1.protect, container_1.paymentController.refundToWallet.bind(container_1.paymentController));
router.post('/spare-parts/wallet', authMiddleware_1.protect, container_1.paymentController.processSparePartsWalletPayment.bind(container_1.paymentController));
exports.default = router;
