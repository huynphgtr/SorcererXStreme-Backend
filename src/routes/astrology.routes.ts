import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getAstrologyOverview,getAstrologyNatalChart, getAstrologyLove } from '../controllers/astrology.controller';

const router = Router();

router.use(authenticateToken);
router.post('/overview', getAstrologyOverview);
router.post('/natal-chart', getAstrologyNatalChart);
router.post('/love', getAstrologyLove);

export default router;
