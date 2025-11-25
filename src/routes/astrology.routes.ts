import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { processAstrologyReading } from '../controllers/astrology.controller';

const router = Router();

router.use(authenticateToken);
router.post('/reading', processAstrologyReading);

export default router;
