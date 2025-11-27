import { Router } from 'express';
import { createNewSession, sendMessage } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; 
// import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authenticateToken);
// router.post('/', checkFeatureLimit('chat'), sendMessage);
router.post('/new-session', createNewSession);
router.post('/message', sendMessage);
// router.get('/history', getChatHistory);

export default router;
