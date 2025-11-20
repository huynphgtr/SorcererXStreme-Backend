import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getNumerology } from '../controllers/numerology.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authMiddleware);

// Apply feature limit check
router.post('/', checkFeatureLimit('numerology'), getNumerology);

export default router;
