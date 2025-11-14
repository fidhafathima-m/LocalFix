import { Router } from "express";
import { protect } from "../../middleware/authMiddleware";

export const createTechnicianOrderRoutes = (technicianOrderController: any) => {
  const router = Router();

  // Technician order routes
  router.get("/", protect, technicianOrderController.getTechnicianOrders);
  router.get(
    "/stats",
    protect,
    technicianOrderController.getTechnicianOrderStats,
  );
  router.get(
    "/:orderId",
    protect,
    technicianOrderController.getTechnicianOrderById,
  );
  router.patch(
    "/:orderId/status",
    protect,
    technicianOrderController.updateOrderStatus,
  );

  return router;
};

export default createTechnicianOrderRoutes;
