import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { getTarotOverview, getTarotQuestion } from '../controllers/tarot.controller';

const router = Router();

router.use(authenticateToken);
router.post('/overview', getTarotOverview);
router.post('/question', getTarotQuestion);

export default router;
