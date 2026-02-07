"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/messageRoutes.ts
const express_1 = require("express");
const container_1 = require("../../config/container");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/:orderId', container_1.messageController.getOrderMessages);
router.get('/conversations/user', container_1.messageController.getUserConversations);
router.get('/conversations/technician', container_1.messageController.getTechnicianConversations);
router.post('/read', container_1.messageController.markMessagesAsRead);
router.get('/unread-count', container_1.messageController.getUnreadCount);
router.patch('/mark-all-read', container_1.messageController.markAllMessagesAsRead);
router.post('/send', container_1.messageController.sendMessage);
router.post('/room/initialize', container_1.messageController.initializeChatRoom);
router.put('/room/close/:orderId', container_1.messageController.closeChatRoom);
exports.default = router;
