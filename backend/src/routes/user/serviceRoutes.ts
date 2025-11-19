import { Router } from 'express';
import { serviceController } from '../../config/container';

const router = Router();

router.get('/', serviceController.getAllServices);
router.get('/search', serviceController.searchServices);
router.get('/category/:categoryId', serviceController.getServicesByCategoryId);
router.get('/:id', serviceController.getServiceById);
router.get('/slug/:slug', serviceController.getServiceBySlug);

export default router;
