"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const container_1 = require("../../config/container");
const router = (0, express_1.Router)();
router.post('/message', authMiddleware_1.protect, container_1.technicianChatController.sendMessage);
exports.default = router;
