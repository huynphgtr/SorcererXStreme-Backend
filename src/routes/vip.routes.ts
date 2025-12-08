import express from 'express';
import { VIPController } from '../controllers/vip.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; // Middleware xác thực User

const router = express.Router();
router.use(authenticateToken);
router.get('/status', VIPController.getVIPStatus);
router.get('/check-access', VIPController.checkAccess);
router.get('/history', VIPController.getHistory);
router.post('/cancel', VIPController.cancelSubscription);

export default router;