import { categoryManagementController } from '../../config/container';
import { Router } from '../../types/express';

const router = Router();

router.post('/', categoryManagementController.createCategory);
router.get('/', categoryManagementController.getAllCategories);
router.get('/search', categoryManagementController.searchCategories);
router.get('/:id', categoryManagementController.getCategoryById);
router.get('/slug/:slug', categoryManagementController.getCategoryBySlug);
router.put('/:id', categoryManagementController.updateCategory);
router.delete('/:id', categoryManagementController.deleteCategory);

export default router;
