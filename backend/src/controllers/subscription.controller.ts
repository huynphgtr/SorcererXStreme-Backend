import { Request, Response } from 'express';
import { VIPService } from '../services/vip.service';
import { VIPTier, VIP_PLANS, VIP_TIER_LIMITS } from '../types/vip.types';

export class SubscriptionController {
  // Lấy thông tin plans
  static async getPlans(req: Request, res: Response) {
    try {
      res.json({
        plans: VIP_PLANS,
        limits: VIP_TIER_LIMITS
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lấy thông tin subscription hiện tại của user
  static async getCurrentSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const limits = await VIPService.getUserLimits(userId);
      const history = await VIPService.getSubscriptionHistory(userId);

      res.json({
        ...limits,
        history: history.slice(0, 5) // 5 giao dịch gần nhất
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Tạo subscription mới (mock payment - thực tế sẽ tích hợp payment gateway)
  static async createSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { tier, durationMonths, paymentMethod, transactionId } = req.body;

      // Validate tier
      if (!Object.values(VIPTier).includes(tier)) {
        return res.status(400).json({ message: 'Invalid tier' });
      }

      if (tier === VIPTier.FREE) {
        return res.status(400).json({ message: 'Cannot purchase FREE tier' });
      }

      // Tính giá
      const plan = VIP_PLANS.find(p => p.tier === tier);
      if (!plan) {
        return res.status(400).json({ message: 'Plan not found' });
      }

      const price = plan.price * (durationMonths || 1);

      // TODO: Tích hợp payment gateway ở đây
      // - Gọi API thanh toán (Momo, VNPay, ZaloPay...)
      // - Verify payment
      // - Nếu thành công mới tạo subscription

      const subscription = await VIPService.createSubscription({
        userId,
        tier,
        price,
        durationMonths: durationMonths || 1,
        paymentMethod,
        transactionId: transactionId || `MOCK_${Date.now()}`
      });

      res.json({
        message: 'Subscription created successfully',
        subscription
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Hủy subscription
  static async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const subscription = await VIPService.cancelSubscription(userId);

      res.json({
        message: 'Subscription cancelled. You can still use VIP features until expiration date.',
        subscription
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Lịch sử subscription
  static async getHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const history = await VIPService.getSubscriptionHistory(userId);

      res.json({ history });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Kiểm tra quyền truy cập feature (để frontend check trước)
  static async checkFeatureAccess(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { feature } = req.query;

      if (!feature) {
        return res.status(400).json({ message: 'Feature parameter required' });
      }

      const access = await VIPService.checkFeatureAccess(userId, feature as any);

      res.json(access);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Admin: Check expired subscriptions (cron job endpoint)
  static async checkExpiredSubscriptions(req: Request, res: Response) {
    try {
      // TODO: Add admin auth middleware
      const count = await VIPService.checkExpiredSubscriptions();
      res.json({ message: `Checked and updated ${count} expired subscriptions` });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

