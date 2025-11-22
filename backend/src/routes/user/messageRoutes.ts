// routes/messageRoutes.ts
import { Router } from 'express';
import { messageController } from '../../config/container';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/:orderId', messageController.getOrderMessages);
router.get('/conversations/user', messageController.getUserConversations);
router.get(
  '/conversations/technician',
  messageController.getTechnicianConversations
);
router.post('/read', messageController.markMessagesAsRead);
router.get('/unread-count', messageController.getUnreadCount);
router.patch('/mark-all-read', messageController.markAllMessagesAsRead);

router.post('/send', messageController.sendMessage);
router.post('/room/initialize', messageController.initializeChatRoom);
router.put('/room/close/:orderId', messageController.closeChatRoom);

export default router;
