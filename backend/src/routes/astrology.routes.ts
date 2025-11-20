import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getAstrology } from '../controllers/astrology.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authMiddleware);

// Apply feature limit check
router.post('/', checkFeatureLimit('astrology'), getAstrology);

export default router;
