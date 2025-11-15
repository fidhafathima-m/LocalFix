import { Router } from 'express';

export const createPaymentManagementRoutes = (
  paymentManagementController: any
) => {
  const router = Router();

  router.get('/', paymentManagementController.getPayments);
  router.get('/stats', paymentManagementController.getPaymentStats);
  router.get('/export', paymentManagementController.exportPayments);
  router.get('/:id', paymentManagementController.getPaymentById);
  router.post('/:paymentId/refund', paymentManagementController.processRefund);

  return router;
};

export default createPaymentManagementRoutes;
