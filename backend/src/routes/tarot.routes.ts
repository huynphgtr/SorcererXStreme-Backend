import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getTarotReading } from '../controllers/tarot.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authMiddleware);

// Apply feature limit check before tarot reading
router.post('/reading', checkFeatureLimit('tarot'), getTarotReading);

export default router;
