import { technicianManagementSubscriptionController } from '../../config/container';
import { admin, protect } from '../../middleware/authMiddleware';
import { Router } from 'express';

export const createTechnicianRoutes = (technicianManagementController: any) => {
  const router = Router();

  router.get('/public', technicianManagementController.getPublicTechnicians);
  router.get(
    '/public/service/:service',
    technicianManagementController.getTechniciansByService
  );
  router.get(
    '/public/:id',
    technicianManagementController.getPublicTechnicianById
  );
  router.get(
    '/public/:technicianId/availability',
    technicianManagementController.getTechnicianPublicAvailability
  );

  router.get(
    '/',
    protect,
    admin,
    technicianManagementController.getAllTechnicians
  );
  router.get(
    '/stats',
    protect,
    admin,
    technicianManagementController.getTechnicianStats
  );
  router.get(
    '/:id',
    protect,
    admin,
    technicianManagementController.getTechnicianById
  );
  router.patch(
    '/:id/status',
    protect,
    admin,
    technicianManagementController.updateTechnicianStatus
  );

  // APPLICATION MANAGEMENT ROUTES
  router.get(
    '/applications/pending',
    protect,
    admin,
    technicianManagementController.getPendingApplications
  );
  router.get(
    '/applications/stats',
    protect,
    admin,
    technicianManagementController.getApplicationStats
  );
  router.get(
    '/applications/:id',
    protect,
    admin,
    technicianManagementController.getApplicationById
  );
  router.patch(
    '/applications/:id/approve',
    protect,
    admin,
    technicianManagementController.approveApplication
  );
  router.patch(
    '/applications/:id/reject',
    protect,
    admin,
    technicianManagementController.rejectApplication
  );

  // SLOT RULES & AVAILABILITY ROUTES
  router.get(
    '/:id/slot-rules',
    technicianManagementController.getTechnicianSlotRules
  );

  router.get(
    '/:id/availability',
    technicianManagementController.getTechnicianAvailability
  );

  // SUBSCRIPTION ROUTES
  router.get(
    '/technician-subscriptions',
    protect,
    admin,
    technicianManagementSubscriptionController.getTechnicianSubscriptions
  );

  router.get(
    '/technician-subscriptions/stats',
    protect,
    admin,
    technicianManagementSubscriptionController.getSubscriptionStats
  );

  router.get(
    '/technician-subscriptions/:id',
    protect,
    admin,
    technicianManagementSubscriptionController.getSubscriptionById
  );

  router.get(
    '/:technicianId/subscriptions',
    protect,
    admin,
    technicianManagementSubscriptionController.getSubscriptionsByTechnician
  );

  router.get(
    '/:technicianId/subscriptions/current',
    protect,
    admin,
    technicianManagementSubscriptionController.getTechnicianCurrentSubscription
  );

  router.patch(
    '/technician-subscriptions/:id/status',
    protect,
    admin,
    technicianManagementSubscriptionController.updateSubscriptionStatus
  );

  return router;
};

export default createTechnicianRoutes;
