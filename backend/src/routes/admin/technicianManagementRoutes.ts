import { admin, protect } from "../../middleware/authMiddleware";
import { Router } from "express";
import { technicianManagementController } from "../../config/container";

const router = Router();

router.get("/public", technicianManagementController.getPublicTechnicians);
router.get(
  "/public/service/:service",
  technicianManagementController.getTechniciansByService
);
router.get(
  "/public/:id",
  technicianManagementController.getPublicTechnicianById
);

router.get(
  "/",
  protect,
  admin,
  technicianManagementController.getAllTechnicians
);
router.get(
  "/stats",
  protect,
  admin,
  technicianManagementController.getTechnicianStats
);
router.get(
  "/:id",
  protect,
  admin,
  technicianManagementController.getTechnicianById
);
router.patch(
  "/:id/status",
  protect,
  admin,
  technicianManagementController.updateTechnicianStatus
);

// APPLICATION MANAGEMENT ROUTES
router.get(
  "/applications/pending",
  protect,
  admin,
  technicianManagementController.getPendingApplications
);
router.get(
  "/applications/stats",
  protect,
  admin,
  technicianManagementController.getApplicationStats
);
router.get(
  "/applications/:id",
  protect,
  admin,
  technicianManagementController.getApplicationById
);
router.patch(
  "/applications/:id/approve",
  protect,
  admin,
  technicianManagementController.approveApplication
);
router.patch(
  "/applications/:id/reject",
  protect,
  admin,
  technicianManagementController.rejectApplication
);

export default router;
