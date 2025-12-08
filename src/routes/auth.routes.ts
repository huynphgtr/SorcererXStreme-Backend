import { Router } from 'express';
import { register, login, logout, forgotPassword, resetPassword  } from '../controllers/auth.controller';

const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
// authRoutes.post('/forgot-password', forgotPassword);
// authRoutes.post('/reset-password', resetPassword);

export default authRoutes;
