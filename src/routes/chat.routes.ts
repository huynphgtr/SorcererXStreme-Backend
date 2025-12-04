import { Router } from 'express';
import { createNewSession, processMessage } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authenticateToken);
router.post('/new-session', createNewSession);
router.post('/', checkFeatureLimit('chat'), processMessage);

export default router;
