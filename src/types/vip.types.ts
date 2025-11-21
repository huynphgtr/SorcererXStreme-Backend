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
  tarotReadingsPerDay: number;
  tarotCardOptions: number[]; 
  tarotHistoryDays: number;
  
  // Astrology
  astrologyAnalysisPerDay: number;
  astrology3DVisualization: boolean;
  
  // Fortune
  fortuneReadingsPerDay: number;
  comprehensiveFortune: boolean;
  
  // Numerology
  numerologyAnalysisPerDay: number;
  
  // Other
  prioritySupport: boolean;
  earlyAccess: boolean;
  adFree: boolean;
  customThemes: boolean;
}

export const VIP_TIER_LIMITS: Record<VIPTier, VIPFeatureLimits> = {
  [VIPTier.FREE]: {
    tarotReadingsPerDay: 3,
    tarotCardOptions: [3],
    tarotHistoryDays: 7,
    chatMessagesPerDay: 10,
    chatHistoryDays: 3,
    astrologyAnalysisPerDay: 1,
    astrology3DVisualization: false,
    fortuneReadingsPerDay: 1,
    comprehensiveFortune: false,
    numerologyAnalysisPerDay: 1,
    prioritySupport: false,
    earlyAccess: false,
    adFree: false,
    customThemes: false,
  },
  [VIPTier.VIP]: {
    tarotReadingsPerDay: -1, // unlimited
    tarotCardOptions: [3, 5, 7],
    tarotHistoryDays: -1, // unlimited
    chatMessagesPerDay: -1, // unlimited
    chatHistoryDays: -1, // unlimited
    astrologyAnalysisPerDay: -1, // unlimited
    astrology3DVisualization: true,
    fortuneReadingsPerDay: -1, // unlimited
    comprehensiveFortune: true,
    numerologyAnalysisPerDay: -1, // unlimited
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
      '3 lượt xem Tarot/ngày',
      'Rút 3 lá bài',
      'Lưu lịch sử 7 ngày',
      '10 tin nhắn chat AI/ngày',
      '1 phân tích chiêm tinh/ngày',
      '1 phân tích tử vi/ngày',
      '1 phân tích thần số học/ngày',
      'Không có biểu đồ 3D',
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
      '♾️ Xem Tarot không giới hạn',
      'Rút 3, 5, hoặc 7 lá bài',
      'Lưu lịch sử vô hạn',
      '♾️ Chat AI không giới hạn',
      '♾️ Tử vi không giới hạn',
      '♾️ Thần số học không giới hạn',
      'Biểu đồ 3D đầy đủ',
      'Tử vi tổng quát',
      '🎯 Hỗ trợ ưu tiên',
      '🚀 Ưu tiên nhận tính năng mới',
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

