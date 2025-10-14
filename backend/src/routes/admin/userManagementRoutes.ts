import { Router } from "express";
import UserManagementController from "../../controllers/admin/userManagement"; 
import { admin, protect } from "../../middleware/authMiddleware";

const router = Router();

// USER MANAGEMENT ROUTES
router.get("/", protect, admin, UserManagementController.getUsers);
router.get("/stats", protect, admin, UserManagementController.getUserStats);
router.get("/:userId", protect, admin, UserManagementController.getUserById);
router.patch(
  "/:userId/status",
  protect,
  admin,
  UserManagementController.updateUserStatus
);
router.put("/:userId", protect, admin, UserManagementController.editUser);
router.delete("/:userId", protect, admin, UserManagementController.deleteUser);

export default router;
