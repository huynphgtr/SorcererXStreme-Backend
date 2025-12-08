import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PaymentService } from '../services/payment.service';
import { VIPTier } from '../types/vip.types';

const prisma = new PrismaClient();
// 1.Tạo tài khoản
export const createPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { tier, durationMonths } = req.body;    
    let price = tier === VIPTier.VIP ? 2000 * durationMonths : 0;    
    if (price === 0) return res.status(400).json({ success: false, message: "Invalid tier" });
    const result = await PaymentService.createPaymentRequest(userId, tier, price, durationMonths);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// 2. Webhook từ SePay
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const sepayApiKey = process.env.SEPAY_API_KEY; 
    if (!authHeader || !authHeader.includes(sepayApiKey as string)) {
       return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { content, transferAmount } = req.body;     
    if (!content || !transferAmount) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await PaymentService.processWebhook({ 
        content, 
        amount: Number(transferAmount),
        paymentDate: req.body.transactionDate
    });

    if (result.success) {
        return res.json({ success: true, message: 'Sepay update success' });
    } else {
        console.log('[Webhook Logic Fail]', result.reason);
        return res.json({ success: false, message: result.reason });
    }

  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 3. Client Polling
export const checkPaymentStatus = async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
          res.status(401).json({ message: 'Unauthorized' });
          return;
        }
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId }
        });
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (subscription.user_id !== userId) {
             return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        res.json({ 
            success: true, 
            status: subscription.status,
            isPaid: subscription.status === 'active'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error checking status' });
    }
};