import { serviceManagementController } from "../../config/container";
import { Router } from "express";

const router = Router();

// Routes
router.post("/", serviceManagementController.createService);
router.get("/", serviceManagementController.getAllServices);
router.get("/search", serviceManagementController.searchServices);
router.get("/category/:categoryId", serviceManagementController.getServicesByCategoryId);
router.get("/:id", serviceManagementController.getServiceById);
router.get("/slug/:slug", serviceManagementController.getServiceBySlug);
router.put("/:id", serviceManagementController.updateService);
router.delete("/:id", serviceManagementController.deleteService);

export default router;