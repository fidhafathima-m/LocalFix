"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSparePartsRequestRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const createSparePartsRequestRoutes = (sparePartsRequestController) => {
    const router = (0, express_1.Router)();
    // Technician routes
    router.post('/requests', authMiddleware_1.protect, sparePartsRequestController.createSparePartsRequest);
    router.get('/orders/:orderId/requests', authMiddleware_1.protect, sparePartsRequestController.getSparePartsRequestsByOrder);
    // Customer routes (for approval)
    router.put('/requests/:requestId/status', authMiddleware_1.protect, sparePartsRequestController.updateSparePartsRequestStatus);
    return router;
};
exports.createSparePartsRequestRoutes = createSparePartsRequestRoutes;
exports.default = exports.createSparePartsRequestRoutes;
