import { Router } from 'express';
import { technicianSubscriptionController } from '../../config/container';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

// Public routes for technicians to view available subscription plans
router.get(
  '/current',
  protect,
  technicianSubscriptionController.getCurrentSubscription
);
router.get(
  '/history',
  protect,
  technicianSubscriptionController.getSubscriptionHistory
);
router.get(
  '/purchase/:purchaseId',
  protect,
  technicianSubscriptionController.getSubscriptionPurchaseById
);
router.get('/', technicianSubscriptionController.getActiveSubscriptions);
router.get('/:id', technicianSubscriptionController.getSubscriptionById);
router.get(
  '/slug/:slug',
  technicianSubscriptionController.getSubscriptionBySlug
);

router.post(
  '/:id/payment/razorpay-order',
  protect,
  technicianSubscriptionController.createRazorpayOrder
);
router.post(
  '/:id/payment/wallet',
  protect,
  technicianSubscriptionController.processWalletPayment
);
router.post(
  '/payment/verify',
  protect,
  technicianSubscriptionController.verifyPayment
);

export default router;
