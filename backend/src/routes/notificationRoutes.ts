// src/routes/notificationRoutes.ts
import { notificationController } from "../config/container";
import { Router } from "express";

const router = Router();

// Routes
router.get("/", notificationController.getNotificationsByUser);
router.get("/unread-count", notificationController.getUnreadCount);
router.put("/:notificationId/read", notificationController.markAsRead);
router.put("/mark-all-read", notificationController.markAllAsRead);

export default router;