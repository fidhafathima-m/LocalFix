"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentManagementRoutes = void 0;
const express_1 = require("express");
const createPaymentManagementRoutes = (paymentManagementController) => {
    const router = (0, express_1.Router)();
    router.get('/', paymentManagementController.getPayments);
    router.get('/stats', paymentManagementController.getPaymentStats);
    router.get('/export', paymentManagementController.exportPayments);
    router.get('/:id', paymentManagementController.getPaymentById);
    router.post('/:paymentId/refund', paymentManagementController.processRefund);
    return router;
};
exports.createPaymentManagementRoutes = createPaymentManagementRoutes;
exports.default = exports.createPaymentManagementRoutes;
