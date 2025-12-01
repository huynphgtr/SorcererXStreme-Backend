export enum VIPTier {
  FREE = 'FREE',
  VIP = 'VIP'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface VIPFeatureLimits {
  
  // Chat
  chatMessagesPerDay: number;
  chatHistoryDays: number;  
  
  // Tarot
  tarotOverviewPerDay: number; 
  tarotQuestionPerDay: number; 
  tarotCardOptions: number[]; 
  tarotHistoryDays: number;
  
  // Astrology (Chiêm tinh)
  astrologyOverviewPerDay: number; 
  astrologyLovePerDay: number;    

  
  // Horoscope (Tử vi hàng ngày)
  horoscopeDailyPerDay: number;
  comprehensiveHoroscope: boolean;
  
  // Numerology (Thần số học)
  numerologyOverviewPerDay: number;
  
  // Other
  prioritySupport: boolean;
  earlyAccess: boolean;
  adFree: boolean;
  customThemes: boolean;
}

export const VIP_TIER_LIMITS: Record<VIPTier, VIPFeatureLimits> = {
  [VIPTier.FREE]: {
    // Chat: 10 req
    chatMessagesPerDay: 10,
    chatHistoryDays: 3,

    // Tarot: 5 overview, 5 question
    tarotOverviewPerDay: 5,
    tarotQuestionPerDay: 5,
    tarotCardOptions: [3],
    tarotHistoryDays: 7,

    // Astrology: 5 overview, 1 love
    astrologyOverviewPerDay: 5,
    astrologyLovePerDay: 1,
    // astrology3DVisualization: false,

    // Horoscope: 5 daily
    horoscopeDailyPerDay: 5,
    comprehensiveHoroscope: false,

    // Numerology: 5 overview
    numerologyOverviewPerDay: 5,

    // Other
    prioritySupport: false,
    earlyAccess: false,
    adFree: false,
    customThemes: false,
  },
  [VIPTier.VIP]: {
    chatMessagesPerDay: -1, 
    chatHistoryDays: -1, 

    tarotOverviewPerDay: -1, 
    tarotQuestionPerDay: -1, 
    tarotCardOptions: [3], 
    tarotHistoryDays: -1, 

    astrologyOverviewPerDay: -1, 
    astrologyLovePerDay: -1, 

    horoscopeDailyPerDay: -1, 
    comprehensiveHoroscope: true,

    numerologyOverviewPerDay: -1, 

    prioritySupport: true,
    earlyAccess: true,
    adFree: true,
    customThemes: true,
  },
};

export interface VIPPlanInfo {
  tier: VIPTier;
  name: string;
  nameEn: string;
  price: number;
  duration: string;
  color: string;
  description: string;
  features: string[];
  icon: string;
}

export const VIP_PLANS: VIPPlanInfo[] = [
  {
    tier: VIPTier.FREE,
    name: 'Miễn phí',
    nameEn: 'Free Tier',
    price: 0,
    duration: 'mãi mãi',
    color: 'from-gray-500 to-gray-600',
    description: 'Trải nghiệm các tính năng cơ bản',
    icon: '✨',
    features: [
      '10 tin nhắn chat AI/ngày',
      '5 lượt Tarot tổng quan/ngày',
      '5 câu hỏi Tarot cụ thể/ngày',
      '5 phân tích bản đồ sao/ngày',
      '1 phân tích tình duyên/ngày',
      '5 phân tích thần số học/ngày',
      '5 xem tử vi hàng ngày/ngày',
      'Lưu lịch sử 7 ngày',
      'Có quảng cáo'
    ]
  },
  {
    tier: VIPTier.VIP,
    name: 'VIP',
    nameEn: 'VIP',
    price: 50000,
    duration: 'tháng',
    color: 'from-yellow-400 to-amber-500',
    description: 'Không giới hạn + Đầy đủ tính năng',
    icon: '👑',
    features: [
      '♾️ Chat AI không giới hạn',
      '♾️ Xem Tarot không giới hạn (Rút 3 lá)',
      '♾️ Chiêm tinh & Tình duyên không giới hạn',
      '♾️ Thần số học & Tử vi không giới hạn',
      'Lưu lịch sử trọn đời',
      'Biểu đồ 3D đầy đủ',
      '🎯 Hỗ trợ ưu tiên',
      '🚀 Không quảng cáo & Giao diện riêng',
      '💎 Huy hiệu VIP đặc biệt'
    ]
  }
];

export interface SubscriptionData {
  userId: string;
  tier: VIPTier;
  price: number;
  durationMonths: number;
  paymentMethod?: string;
  transactionId?: string;
}