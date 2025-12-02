import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { getNumerology } from '../controllers/numerology.controller';
import { checkFeatureLimit } from '../middlewares/vip.middleware';

const router = Router();

router.use(authenticateToken);
router.post('/', checkFeatureLimit('numerology'), getNumerology);
export default router;
