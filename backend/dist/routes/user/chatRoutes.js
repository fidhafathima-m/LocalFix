"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/chatRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const container_1 = require("../../config/container");
const router = (0, express_1.Router)();
// Public or protected routes based on your needs
router.post('/message', authMiddleware_1.protect, container_1.chatController.sendMessage);
router.get('/history', authMiddleware_1.protect, container_1.chatController.getChatHistory);
// Optional: Public endpoint for pre-login queries
router.post('/public/message', container_1.chatController.sendMessage);
exports.default = router;
