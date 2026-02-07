"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middleware/authMiddleware");
const container_1 = require("../config/container");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/profile", authMiddleware_1.protect, container_1.publicUserManagementController.getUserProfile);
router.get("/:userId", container_1.publicUserManagementController.getPublicUserById);
exports.default = router;
