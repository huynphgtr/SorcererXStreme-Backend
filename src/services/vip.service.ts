import { PrismaClient, UsageStats } from '@prisma/client';
import { VIPTier, VIP_TIER_LIMITS, SubscriptionData, SubscriptionStatus, BANK_CONFIG } from '../types/vip.types';

const prisma = new PrismaClient();

export class VIPService {

  static async checkFeatureAccess(
    userId: string,
    feature: keyof typeof VIP_TIER_LIMITS.FREE
  ): Promise<{ allowed: boolean; currentUsage?: number; limit?: number; tier: VIPTier }> {
    console.log(`[VIPService] Checking access for userId: ${userId}, feature: ${feature}`);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { usageStats: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Lấy Tier hiện tại và Limit tương ứng
    const tier = await this.getCurrentTier(userId);
    const limits = VIP_TIER_LIMITS[tier];
    const featureLimit = limits[feature];

    // 1.1 Xử lý các feature không phải dạng số đếm (Boolean hoặc Array)
    if (typeof featureLimit === 'boolean') {
      return { allowed: featureLimit, tier };
    }
    if (Array.isArray(featureLimit)) {
      return { allowed: true, tier };
    }

    // 1.2 Xử lý trường hợp Unlimited (-1)
    if (featureLimit === -1) {
      return { allowed: true, limit: -1, tier };
    }

    // 1.3 Kiểm tra Usage (Số lần đã dùng)
    let stats = user.usageStats;

    // Nếu chưa có bảng stats, tạo mới
    if (!stats) {
      stats = await prisma.usageStats.create({
        data: { 
          user_id: userId,
          chat_messages_today: 0,
          tarot_overview_today: 0,
          tarot_question_today: 0,
          astrology_overview_today: 0,
          astrology_love_today: 0,
          numerology_today: 0,
          horoscope_daily_today: 0,
          horoscope_natal_chart: 0
        }
      });
      return { allowed: true, currentUsage: 0, limit: featureLimit as number, tier };
    }

    // Reset nếu qua ngày mới (So sánh ngày hiện tại với last_reset_date)
    const today = new Date().toDateString();
    const lastReset = new Date(stats.last_reset_date).toDateString();
    
    if (today !== lastReset) {
      stats = await prisma.usageStats.update({
        where: { user_id: userId },
        data: {
          chat_messages_today: 0,
          tarot_overview_today: 0,
          tarot_question_today: 0,
          astrology_overview_today: 0,
          astrology_love_today: 0,
          numerology_today: 0,
          horoscope_daily_today: 0,
          last_reset_date: new Date()
        }
      });
    }

    // 1.4 Map tên feature sang tên cột trong Database
    // Key: Tên trong vip.types.ts -> Value: Tên cột trong Schema Prisma
    const usageMap: Record<string, keyof Omit<UsageStats, 'id' | 'user_id' | 'last_reset_date'>> = {
      chatMessagesPerDay: 'chat_messages_today',
      
      tarotOverviewPerDay: 'tarot_overview_today',
      tarotQuestionPerDay: 'tarot_question_today',
      
      astrologyOverviewPerDay: 'astrology_overview_today',
      astrologyLovePerDay: 'astrology_love_today',
      
      horoscopeDailyPerDay: 'horoscope_daily_today', 
      horoscopeNatalChart: 'horoscope_natal_chart',
      numerologyOverviewPerDay: 'numerology_today'
    };

    const usageField = usageMap[feature];

    // Nếu feature không có trong map tracking (ví dụ feature mới chưa add), mặc định cho phép
    if (!usageField) {
      console.warn(`[VIPService] Feature ${feature} not mapped to DB column. Allowing access.`);
      return { allowed: true, tier }; 
    }

    const currentUsage = stats[usageField] as number;
    const allowed = currentUsage < (featureLimit as number);

    return { allowed, currentUsage, limit: featureLimit as number, tier };
  }

  static async incrementUsage(userId: string, featureKey: 
    'chat' | 
    'tarot_overview' | 'tarot_question' | 
    'astrology_overview' | 'astrology_love' | 
    'horoscope_daily' | 'horoscope_natal_chart' | 'numerology'
  ): Promise<void> {
    
    // Map action key sang column DB
    const usageMap: Record<string, keyof Omit<UsageStats, 'id' | 'user_id' | 'last_reset_date'>> = {
      chat: 'chat_messages_today',
      tarot_overview: 'tarot_overview_today',
      tarot_question: 'tarot_question_today',
      astrology_overview: 'astrology_overview_today',
      astrology_love: 'astrology_love_today',
      horoscope_daily: 'horoscope_daily_today',
      horoscope_natal_chart: 'horoscope_natal_chart',
      numerology: 'numerology_today'
    };

    const field = usageMap[featureKey];
    if (!field) {
      console.error(`[VIPService] Invalid feature key for increment: ${featureKey}`);
      return;
    }

    // Upsert: Nếu có thì update, chưa có thì create
    // Prisma upsert yêu cầu 'where' unique, UsageStats có user_id unique
    try {
      await prisma.usageStats.upsert({
        where: { user_id: userId },
        update: {
          [field]: { increment: 1 }
        },
        create: {
          user_id: userId,
          [field]: 1,
          // Các trường khác mặc định là 0 (theo schema)
        }
      });
    } catch (error) {
      console.error(`[VIPService] Error incrementing usage for ${userId}:`, error);
    }
  }

  static async getCurrentTier(userId: string): Promise<VIPTier> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { vip_tier: true, vip_expires_at: true } // Chỉ select field cần thiết để tối ưu
    });

    if (!user) {
      throw new Error('User not found');
    }
    if (user.vip_expires_at && new Date() > user.vip_expires_at) {
      await prisma.user.update({
        where: { id: userId },
        data: { vip_tier: VIPTier.FREE, vip_expires_at: null }
      });
      return VIPTier.FREE;
    }
    return user.vip_tier as VIPTier;
  }

  // Lấy thông tin giới hạn của user (để hiển thị UI)
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
  // static async createSubscription(data: SubscriptionData) {
  //   const { userId, tier, price, durationMonths, paymentMethod, transactionId } = data;

  //   const startDate = new Date();
  //   const endDate = new Date();
  //   // Logic cộng tháng thông minh hơn (tránh lỗi ngày 31)
  //   endDate.setMonth(endDate.getMonth() + durationMonths);

  //   // Tạo subscription record
  //   const subscription = await prisma.subscription.create({
  //     data: {
  //       user_id: userId,
  //       tier,
  //       price,
  //       start_date: startDate,
  //       end_date: endDate,
  //       status: SubscriptionStatus.ACTIVE,
  //       payment_method: paymentMethod,
  //       transaction_id: transactionId
  //     }
  //   });

  //   // Update user tier
  //   await prisma.user.update({
  //     where: { id: userId },
  //     data: {
  //       vip_tier: tier,
  //       vip_expires_at: endDate
  //     }
  //   });

  //   return subscription;
  // }

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

    return activeSubscription;
  }

  // Lấy lịch sử subscription
  static async getSubscriptionHistory(userId: string) {
    return await prisma.subscription.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  // Job định kỳ: Kiểm tra hết hạn
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

