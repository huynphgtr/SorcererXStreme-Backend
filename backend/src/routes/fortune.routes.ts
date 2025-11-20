import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getFortune } from '../controllers/fortune.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authMiddleware);

// Apply feature limit check
router.post('/', checkFeatureLimit('fortune'), getFortune);

export default router;
