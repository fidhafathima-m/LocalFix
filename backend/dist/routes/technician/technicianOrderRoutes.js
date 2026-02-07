"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTechnicianOrderRoutes = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const createTechnicianOrderRoutes = (technicianOrderController) => {
    const router = (0, express_1.Router)();
    // Technician order routes
    router.get("/", authMiddleware_1.protect, technicianOrderController.getTechnicianOrders);
    router.get("/stats", authMiddleware_1.protect, technicianOrderController.getTechnicianOrderStats);
    router.get("/:orderId", authMiddleware_1.protect, technicianOrderController.getTechnicianOrderById);
    router.patch("/:orderId/status", authMiddleware_1.protect, technicianOrderController.updateOrderStatus);
    return router;
};
exports.createTechnicianOrderRoutes = createTechnicianOrderRoutes;
exports.default = exports.createTechnicianOrderRoutes;
