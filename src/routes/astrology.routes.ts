import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getAstrology } from '../controllers/astrology.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', getAstrology);

export default router;
