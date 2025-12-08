import express from 'express';
import { createPayment, handleWebhook, checkPaymentStatus } from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; // Giả sử có middleware này

const router = express.Router();

router.post('/create', authenticateToken, createPayment);
router.get('/status/:subscriptionId', authenticateToken, checkPaymentStatus);
router.post('/webhook', handleWebhook);

export default router;