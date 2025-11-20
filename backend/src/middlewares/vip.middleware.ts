import { Request, Response, NextFunction } from 'express';
import { VIPService } from '../services/vip.service';
import { VIPTier } from '../types/vip.types';

// Middleware kiểm tra feature access
export const checkFeatureLimit = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      console.log(`[VIP Middleware] Feature: ${feature}, UserId: ${userId}`);
      
      if (!userId) {
        console.log('[VIP Middleware] No userId found');
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const featureMap: Record<string, any> = {
        tarot: 'tarotReadingsPerDay',
        chat: 'chatMessagesPerDay',
        astrology: 'astrologyAnalysisPerDay',
        fortune: 'fortuneReadingsPerDay',
        numerology: 'numerologyAnalysisPerDay'
      };

      const featureKey = featureMap[feature];
      if (!featureKey) {
        return next();
      }

      const access = await VIPService.checkFeatureAccess(userId, featureKey);

      if (!access.allowed) {
        return res.status(403).json({
          message: 'Feature limit reached',
          error: 'LIMIT_REACHED',
          currentUsage: access.currentUsage,
          limit: access.limit,
          tier: access.tier,
          upgradeRequired: true
        });
      }

      // Lưu thông tin vào request để sử dụng sau
      (req as any).userTier = access.tier;
      (req as any).currentUsage = access.currentUsage;

      next();
    } catch (error: any) {
      console.error(`checkFeatureLimit error for feature "${feature}":`, error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ 
        message: error.message || 'Internal server error',
        error: 'VIP_MIDDLEWARE_ERROR'
      });
    }
  };
};

// Middleware kiểm tra tier tối thiểu
export const requireTier = (...allowedTiers: VIPTier[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const currentTier = await VIPService.getCurrentTier(userId);

      if (!allowedTiers.includes(currentTier)) {
        return res.status(403).json({
          message: 'VIP subscription required',
          error: 'TIER_REQUIRED',
          currentTier,
          requiredTiers: allowedTiers,
          upgradeRequired: true
        });
      }

      (req as any).userTier = currentTier;
      next();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
};

// Middleware kiểm tra feature boolean (ví dụ: 3D visualization)
export const requireFeature = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const access = await VIPService.checkFeatureAccess(userId, featureName as any);

      if (!access.allowed) {
        return res.status(403).json({
          message: `Feature '${featureName}' not available in your plan`,
          error: 'FEATURE_LOCKED',
          tier: access.tier,
          upgradeRequired: true
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
};

