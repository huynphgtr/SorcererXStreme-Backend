import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { getHoroscope } from '../controllers/horoscope.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authenticateToken);
router.post('/daily', checkFeatureLimit('horoscopeDaily'), getHoroscope);
router.post('/natal', checkFeatureLimit('horoscopeNatalChart'), getHoroscope);

export default router;
