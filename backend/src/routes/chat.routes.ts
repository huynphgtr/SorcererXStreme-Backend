import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { sendMessage, getChatHistory } from '../controllers/chat.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authMiddleware);

// Apply feature limit check before sending message
router.post('/', checkFeatureLimit('chat'), sendMessage);
router.get('/history', getChatHistory);

export default router;
