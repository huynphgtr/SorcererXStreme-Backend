import { Router } from 'express';
import { sendMessage } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authenticateToken);
// Apply feature limit check before sending message
router.post('/', checkFeatureLimit('chat'), sendMessage);
// router.get('/history', getChatHistory);

export default router;
