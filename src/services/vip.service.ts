import { PrismaClient } from '@prisma/client';
import { VIPTier, VIP_TIER_LIMITS, SubscriptionData, SubscriptionStatus } from '../types/vip.types';

const prisma = new PrismaClient();

export class VIPService {
  // Kiểm tra user có quyền truy cập feature không
  static async checkFeatureAccess(
    userId: string,
    feature: keyof typeof VIP_TIER_LIMITS.FREE
  ): Promise<{ allowed: boolean; currentUsage?: number; limit?: number; tier: VIPTier }> {
    console.log(`[VIPService] Checking access for userId: ${userId}, feature: ${feature}`);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { usageStats: true }
    });

    console.log(`[VIPService] User found:`, user ? `Yes (${user.email})` : 'No');

    if (!user) {
      throw new Error('User not found');
    }

    // Kiểm tra VIP có hết hạn không
    const tier = await this.getCurrentTier(userId);
    const limits = VIP_TIER_LIMITS[tier];
    const featureLimit = limits[feature];

    // Nếu không có usage tracking (boolean features)
    if (typeof featureLimit === 'boolean') {
      return { allowed: featureLimit, tier };
    }

    // Nếu là array (tarotCardOptions)
    if (Array.isArray(featureLimit)) {
      return { allowed: true, tier };
    }

    // Nếu unlimited (-1)
    if (featureLimit === -1) {
      return { allowed: true, limit: -1, tier };
    }

    // Kiểm tra usage
    const stats = user.usageStats;
    if (!stats) {
      // Tạo mới usage stats
      await prisma.usageStats.create({
        data: { 
          user_id: userId,
          tarot_readings_today: 0,
          chat_messages_today: 0,
          astrology_today: 0,
          fortune_today: 0,
          numerology_today: 0
        }
      });
      return { allowed: true, currentUsage: 0, limit: featureLimit as number, tier };
    }

    // Reset nếu qua ngày mới
    const today = new Date().toDateString();
    const lastReset = new Date(stats.last_reset_date).toDateString();
    
    let currentStats = stats;
    if (today !== lastReset) {
      currentStats = await prisma.usageStats.update({
        where: { user_id: userId },
        data: {
          tarot_readings_today: 0,
          chat_messages_today: 0,
          astrology_today: 0,
          fortune_today: 0,
          numerology_today: 0,
          last_reset_date: new Date()
        }
      });
    }

    // Map feature name to usage stat
    const usageMap: Record<string, keyof typeof stats> = {
      tarotReadingsPerDay: 'tarot_readings_today',
      chatMessagesPerDay: 'chat_messages_today',
      astrologyAnalysisPerDay: 'astrology_today',
      fortuneReadingsPerDay: 'fortune_today',
      numerologyAnalysisPerDay: 'numerology_today'
    };

    const usageField = usageMap[feature];
    if (!usageField) {
      return { allowed: true, tier }; // Feature không có usage tracking
    }

    const currentUsage = currentStats[usageField] as number;
    const allowed = currentUsage < (featureLimit as number);

    return { allowed, currentUsage, limit: featureLimit as number, tier };
  }

  // Increment usage counter
  static async incrementUsage(userId: string, feature: string): Promise<void> {
    const usageMap: Record<string, string> = {
      tarot: 'tarot_readings_today',
      chat: 'chat_messages_today',
      astrology: 'astrology_today',
      fortune: 'fortune_today',
      numerology: 'numerology_today'
    };

    const field = usageMap[feature];
    if (!field) return;

    const stats = await prisma.usageStats.findUnique({
      where: { user_id: userId }
    });

    if (!stats) {
      await prisma.usageStats.create({
        data: {
          user_id: userId,
          [field]: 1
        }
      });
    } else {
      await prisma.usageStats.update({
        where: { user_id: userId },
        data: {
          [field]: { increment: 1 }
        }
      });
    }
  }

  // Lấy tier hiện tại của user
  static async getCurrentTier(userId: string): Promise<VIPTier> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Kiểm tra hết hạn
    if (user.vip_expires_at && new Date() > user.vip_expires_at) {
      // Hết hạn -> downgrade về FREE
      await prisma.user.update({
        where: { id: userId },
        data: { vip_tier: VIPTier.FREE, vip_expires_at: null }
      });
      return VIPTier.FREE;
    }

    return user.vip_tier as VIPTier;
  }

  // Lấy thông tin giới hạn của user
  static async getUserLimits(userId: string) {
    const tier = await this.getCurrentTier(userId);
    const limits = VIP_TIER_LIMITS[tier];
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { usageStats: true }
    });

    return {
      tier,
      limits,
      usage: user?.usageStats || null,
      expiresAt: user?.vip_expires_at
    };
  }

  // Tạo subscription mới
  static async createSubscription(data: SubscriptionData) {
    const { userId, tier, price, durationMonths, paymentMethod, transactionId } = data;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Tạo subscription record
    const subscription = await prisma.subscription.create({
      data: {
        user_id: userId,
        tier,
        price,
        start_date: startDate,
        end_date: endDate,
        status: SubscriptionStatus.ACTIVE,
        payment_method: paymentMethod,
        transaction_id: transactionId
      }
    });

    // Update user tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        vip_tier: tier,
        vip_expires_at: endDate
      }
    });

    return subscription;
  }

  // Hủy subscription
  static async cancelSubscription(userId: string) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE
      },
      orderBy: { created_at: 'desc' }
    });

    if (!activeSubscription) {
      throw new Error('No active subscription found');
    }

    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { status: SubscriptionStatus.CANCELLED }
    });

    // User vẫn dùng được đến hết hạn
    return activeSubscription;
  }

  // Lấy lịch sử subscription
  static async getSubscriptionHistory(userId: string) {
    return await prisma.subscription.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  // Kiểm tra và cập nhật subscriptions hết hạn (chạy định kỳ)
  static async checkExpiredSubscriptions() {
    const now = new Date();
    
    const expiredUsers = await prisma.user.findMany({
      where: {
        vip_expires_at: {
          lte: now
        },
        vip_tier: {
          not: VIPTier.FREE
        }
      }
    });

    for (const user of expiredUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          vip_tier: VIPTier.FREE,
          vip_expires_at: null
        }
      });

      // Update subscription status
      await prisma.subscription.updateMany({
        where: {
          user_id: user.id,
          status: SubscriptionStatus.ACTIVE,
          end_date: {
            lte: now
          }
        },
        data: {
          status: SubscriptionStatus.EXPIRED
        }
      });
    }

    return expiredUsers.length;
  }
}

