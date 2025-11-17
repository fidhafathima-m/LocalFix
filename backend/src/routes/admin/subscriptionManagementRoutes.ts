import { Router } from 'express';
import { subscriptionManagementController } from '../../config/container';

const router = Router();

router.post('/', subscriptionManagementController.createSubscription);
router.get('/', subscriptionManagementController.getAllSubscriptions);
router.get('/search', subscriptionManagementController.searchSubscriptions);
router.get('/:id', subscriptionManagementController.getSubscriptionById);
router.get(
  '/slug/:slug',
  subscriptionManagementController.getSubscriptionBySlug
);
router.put('/:id', subscriptionManagementController.updateSubscription);
router.delete('/:id', subscriptionManagementController.deleteSubscription);

export default router;
