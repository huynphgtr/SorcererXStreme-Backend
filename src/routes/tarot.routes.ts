import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { processTarotRequest } from '../controllers/tarot.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';


const router = Router();

router.use(authenticateToken);
router.post('/overview', checkFeatureLimit('tarotOverview'), processTarotRequest);
router.post('/question', checkFeatureLimit('tarotQuestion'), processTarotRequest);

export default router;
