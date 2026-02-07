"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const container_1 = require("../config/container");
const express_1 = require("express");
const router = (0, express_1.Router)();
// Routes
router.get("/", container_1.notificationController.getNotificationsByUser);
router.get("/unread-count", container_1.notificationController.getUnreadCount);
router.put("/:notificationId/read", container_1.notificationController.markAsRead);
router.put("/mark-all-read", container_1.notificationController.markAllAsRead);
exports.default = router;
