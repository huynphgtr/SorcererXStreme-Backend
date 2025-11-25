import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { getHoroscope } from '../controllers/horoscope.controller';

const router = Router();

router.use(authenticateToken);
router.post('/', getHoroscope);

export default router;
