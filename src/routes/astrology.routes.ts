import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { processAstrologyReading } from '../controllers/astrology.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';


const router = Router();

router.use(authenticateToken);

router.post('/overview', checkFeatureLimit('astrologyOverview'), processAstrologyReading);
router.post('/love', checkFeatureLimit('astrologyLove'), processAstrologyReading);

export default router;
