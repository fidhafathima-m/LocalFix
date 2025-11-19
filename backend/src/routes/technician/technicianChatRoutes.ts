import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware';
import { technicianChatController } from '../../config/container';

const router = Router();

router.post('/message', protect, technicianChatController.sendMessage);

export default router;
