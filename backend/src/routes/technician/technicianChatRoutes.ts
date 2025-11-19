// routes/technicianChatRoutes.ts
import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware';
import { technicianChatController } from '../../config/container';

const router = Router();

// Technician-specific chat endpoints
router.post('/message', protect, technicianChatController.sendMessage);

export default router;
