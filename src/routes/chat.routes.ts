import { Router } from 'express';
// import { authMiddleware } from '../middlewares/auth.middleware';
// import { sendMessage, getChatHistory } from '../controllers/chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; 

const router = Router();

router.use(authenticateToken);
// router.post('/', sendMessage);
// router.get('/history', getChatHistory);

export default router;
