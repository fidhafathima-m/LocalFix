"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const container_1 = require("../../config/container");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
// USER MANAGEMENT ROUTES
router.get("/", authMiddleware_1.protect, authMiddleware_1.admin, container_1.userManagementController.getUsers);
router.get("/stats", authMiddleware_1.protect, authMiddleware_1.admin, container_1.userManagementController.getUserStats);
router.get("/:userId", authMiddleware_1.protect, authMiddleware_1.admin, container_1.userManagementController.getUserById);
router.patch("/:userId/status", authMiddleware_1.protect, authMiddleware_1.admin, container_1.userManagementController.updateUserStatus);
router.put("/:userId", authMiddleware_1.protect, authMiddleware_1.admin, container_1.userManagementController.editUser);
router.delete("/:userId", authMiddleware_1.protect, authMiddleware_1.admin, container_1.userManagementController.deleteUser);
exports.default = router;
