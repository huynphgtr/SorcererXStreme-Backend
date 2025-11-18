import { Router } from 'express';
// import { authMiddleware } from '../middlewares/auth.middleware';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { getTarotReading } from '../controllers/tarot.controller';

const router = Router();

router.use(authenticateToken);

router.post('/reading', getTarotReading);

export default router;
