import { Router } from 'express';
// import { authMiddleware } from '../middlewares/auth.middleware';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { getFortune } from '../controllers/fortune.controller';

const router = Router();

router.use(authenticateToken);

router.post('/', getFortune);

export default router;
