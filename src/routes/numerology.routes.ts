import { Router } from 'express';
// import { authMiddleware } from '../middlewares/auth.middleware';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { getNumerology } from '../controllers/numerology.controller';

const router = Router();

router.use(authenticateToken);
router.post('/', getNumerology);

export default router;
