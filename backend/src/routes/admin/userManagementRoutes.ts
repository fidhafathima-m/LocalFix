import { Router } from "express";
import { userManagementController } from "../../config/container";
import { admin, protect } from "../../middleware/authMiddleware";

const router = Router();

// USER MANAGEMENT ROUTES
router.get("/", protect, admin, userManagementController.getUsers);
router.get("/stats", protect, admin, userManagementController.getUserStats);
router.get("/:userId", protect, admin, userManagementController.getUserById);
router.patch(
  "/:userId/status",
  protect,
  admin,
  userManagementController.updateUserStatus
);
router.put("/:userId", protect, admin, userManagementController.editUser);
router.delete("/:userId", protect, admin, userManagementController.deleteUser);

export default router;
