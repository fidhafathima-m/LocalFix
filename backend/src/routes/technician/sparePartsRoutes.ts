import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware';

export const createSparePartsRequestRoutes = (
  sparePartsRequestController: any
) => {
  const router = Router();

  // Technician routes
  router.post(
    '/requests',
    protect,
    sparePartsRequestController.createSparePartsRequest
  );

  router.get(
    '/orders/:orderId/requests',
    protect,
    sparePartsRequestController.getSparePartsRequestsByOrder
  );

  // Customer routes (for approval)
  router.put(
    '/requests/:requestId/status',
    protect,
    sparePartsRequestController.updateSparePartsRequestStatus
  );

  return router;
};

export default createSparePartsRequestRoutes;
