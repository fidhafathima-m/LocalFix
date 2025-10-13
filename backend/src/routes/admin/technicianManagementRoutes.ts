// src/modules/admin/admin.technicianRoutes.ts
import { admin, protect } from "../../middleware/authMiddleware";
import { Router } from "express";
import technicianManagement from "../../controllers/admin/technicianManagement";

const router = Router();

router.get("/", protect, admin, technicianManagement.getAllTechnicians);
router.get("/stats", protect, admin, technicianManagement.getTechnicianStats);
router.get("/:id", protect, admin, technicianManagement.getTechnicianById);
router.patch(
  "/:id/status",
  protect,
  admin,
  technicianManagement.updateTechnicianStatus
);

// APPLICATION MANAGEMENT ROUTES
router.get(
  "/applications/pending",
  protect,
  admin,
  technicianManagement.getPendingApplications
);
router.get(
  "/applications/stats",
  protect,
  admin,
  technicianManagement.getApplicationStats
);
router.get(
  "/applications/:id",
  protect,
  admin,
  technicianManagement.getApplicationById
);
router.patch(
  "/applications/:id/approve",
  protect,
  admin,
  technicianManagement.approveApplication
);
router.patch(
  "/applications/:id/reject",
  protect,
  admin,
  technicianManagement.rejectApplication
);

export default router;
