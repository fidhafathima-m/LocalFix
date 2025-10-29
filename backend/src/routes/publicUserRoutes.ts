import { protect } from "../middleware/authMiddleware";
import { publicUserManagementController } from "../config/container";
import { Router } from "express";

const router = Router();

router.get("/profile", protect, publicUserManagementController.getUserProfile);
router.get("/:userId", publicUserManagementController.getPublicUserById);

export default router;
