import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { processTarotRequest } from '../controllers/tarot.controller';

const router = Router();

router.use(authenticateToken);
router.post('/reading', processTarotRequest);

export default router;
