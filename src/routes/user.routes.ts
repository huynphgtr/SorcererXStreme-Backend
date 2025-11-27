import { Router } from 'express';
import { completeProfile, getProfile, updateProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; 
import { upgradeToVIP } from '../controllers/vip.controller';
const userRouter = Router();

userRouter.put('/complete-profile', authenticateToken, completeProfile);
userRouter.patch('/update-profile', authenticateToken, updateProfile);
userRouter.get('/profile', authenticateToken, getProfile);
userRouter.post('/upgrade-vip', authenticateToken, upgradeToVIP);

export default userRouter;