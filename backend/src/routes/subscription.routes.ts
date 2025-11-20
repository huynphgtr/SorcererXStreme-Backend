import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/plans', SubscriptionController.getPlans);

// Protected routes
router.get('/current', authMiddleware, SubscriptionController.getCurrentSubscription);
router.post('/subscribe', authMiddleware, SubscriptionController.createSubscription);
router.post('/cancel', authMiddleware, SubscriptionController.cancelSubscription);
router.get('/history', authMiddleware, SubscriptionController.getHistory);
router.get('/check-access', authMiddleware, SubscriptionController.checkFeatureAccess);

// Admin/Cron routes
router.post('/check-expired', SubscriptionController.checkExpiredSubscriptions);

export default router;

