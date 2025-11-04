// routes/orderRoutes.ts - For technician orders
import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";
import { technicianOrderController } from "../../config/container";

const router = Router();

// Technician order routes
router.get('/', protect, technicianOrderController.getTechnicianOrders);
router.get('/stats', protect, technicianOrderController.getTechnicianOrderStats);
router.get('/:orderId', protect, technicianOrderController.getTechnicianOrderById);
router.patch('/:orderId/status', protect, technicianOrderController.updateOrderStatus);

export default router;