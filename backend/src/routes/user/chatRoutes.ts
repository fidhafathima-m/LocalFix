// routes/chatRoutes.ts
import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware';
import { chatController } from '../../config/container';

const router = Router();

// Public or protected routes based on your needs
router.post('/message', protect, chatController.sendMessage);
router.get('/history', protect, chatController.getChatHistory);

// Optional: Public endpoint for pre-login queries
router.post('/public/message', chatController.sendMessage);
router.get('/models', chatController.getModels);

export default router;
