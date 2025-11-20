import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
