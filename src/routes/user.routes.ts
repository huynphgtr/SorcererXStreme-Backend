import { Router } from 'express';
import { completeProfile, getProfile, updateProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; 
const userRouter = Router();

userRouter.put('/complete-profile', authenticateToken, completeProfile);
userRouter.patch('/update-profile', authenticateToken, updateProfile);
userRouter.get('/profile', authenticateToken, getProfile);

export default userRouter;