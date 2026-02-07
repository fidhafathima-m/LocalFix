"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTechnicianRoutes = void 0;
const container_1 = require("../../config/container");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const express_1 = require("express");
const createTechnicianRoutes = (technicianManagementController) => {
    const router = (0, express_1.Router)();
    router.get('/public', technicianManagementController.getPublicTechnicians);
    router.get('/public/service/:service', technicianManagementController.getTechniciansByService);
    router.get('/public/:id', technicianManagementController.getPublicTechnicianById);
    router.get('/public/:technicianId/availability', technicianManagementController.getTechnicianPublicAvailability);
    router.get('/', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.getAllTechnicians);
    router.get('/stats', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.getTechnicianStats);
    router.get('/:id', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.getTechnicianById);
    router.patch('/:id/status', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.updateTechnicianStatus);
    // APPLICATION MANAGEMENT ROUTES
    router.get('/applications/pending', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.getPendingApplications);
    router.get('/applications/stats', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.getApplicationStats);
    router.get('/applications/:id', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.getApplicationById);
    router.patch('/applications/:id/approve', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.approveApplication);
    router.patch('/applications/:id/reject', authMiddleware_1.protect, authMiddleware_1.admin, technicianManagementController.rejectApplication);
    // SLOT RULES & AVAILABILITY ROUTES
    router.get('/:id/slot-rules', technicianManagementController.getTechnicianSlotRules);
    router.get('/:id/availability', technicianManagementController.getTechnicianAvailability);
    // SUBSCRIPTION ROUTES
    router.get('/technician-subscriptions', authMiddleware_1.protect, authMiddleware_1.admin, container_1.technicianManagementSubscriptionController.getTechnicianSubscriptions);
    router.get('/technician-subscriptions/stats', authMiddleware_1.protect, authMiddleware_1.admin, container_1.technicianManagementSubscriptionController.getSubscriptionStats);
    router.get('/technician-subscriptions/:id', authMiddleware_1.protect, authMiddleware_1.admin, container_1.technicianManagementSubscriptionController.getSubscriptionById);
    router.get('/:technicianId/subscriptions', authMiddleware_1.protect, authMiddleware_1.admin, container_1.technicianManagementSubscriptionController.getSubscriptionsByTechnician);
    router.get('/:technicianId/subscriptions/current', authMiddleware_1.protect, authMiddleware_1.admin, container_1.technicianManagementSubscriptionController.getTechnicianCurrentSubscription);
    router.patch('/technician-subscriptions/:id/status', authMiddleware_1.protect, authMiddleware_1.admin, container_1.technicianManagementSubscriptionController.updateSubscriptionStatus);
    return router;
};
exports.createTechnicianRoutes = createTechnicianRoutes;
exports.default = exports.createTechnicianRoutes;
