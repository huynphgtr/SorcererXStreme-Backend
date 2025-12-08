import { Request, Response } from 'express';
import { VIPService } from '../services/vip.service';
import { VIP_TIER_LIMITS } from '../types/vip.types';
// import { UserService } from '../services/user.service';

// export async function upgradeToVIP(req: Request, res: Response): Promise<void> {
//   try {
//     const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ message: 'Unauthorized' });
//       return;
//     }

//     const { tier = 'VIP', durationDays = 30 } = req.body;

//     const updatedUser = await UserService.upgradeToVIP(userId, tier, durationDays);

//     res.status(200).json({
//       message: 'Upgraded to VIP successfully',
//       user: updatedUser,
//     });

//   } catch (error) {
//     console.error('[Upgrade VIP Error]:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }


export class VIPController {

  // ----------------------------------------------------------------
  // 1. Lấy thông tin Dashboard VIP (Status + Usage + Limits)
  // GET /api/vip/status
  // ----------------------------------------------------------------
  static async getVIPStatus(req: Request, res: Response) {
    try {
      const userId = req.user.id; // Lấy từ middleware auth
      
      const data = await VIPService.getUserLimits(userId);
      
      return res.json({
        success: true,
        data: data
      });
    } catch (error: any) {
      console.error('[VIPController] getVIPStatus Error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi lấy thông tin VIP' });
    }
  }

  // ----------------------------------------------------------------
  // 2. Kiểm tra quyền truy cập Feature (Dùng cho UI check trước khi bấm)
  // GET /api/vip/check-access?feature=chatMessagesPerDay
  // ----------------------------------------------------------------
  static async checkAccess(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { feature } = req.query;

      if (!feature || typeof feature !== 'string') {
        return res.status(400).json({ success: false, message: 'Thiếu tên feature cần kiểm tra' });
      }

      // Validate feature key có tồn tại trong config không
      // Ép kiểu để TS không báo lỗi, nhưng runtime cần check kỹ
      const validFeatures = Object.keys(VIP_TIER_LIMITS.FREE);
      if (!validFeatures.includes(feature)) {
        return res.status(400).json({ success: false, message: `Feature '${feature}' không hợp lệ` });
      }

      // Gọi service
      const result = await VIPService.checkFeatureAccess(
        userId, 
        feature as keyof typeof VIP_TIER_LIMITS.FREE
      );

      return res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('[VIPController] checkAccess Error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền hạn' });
    }
  }

  // ----------------------------------------------------------------
  // 3. Lấy lịch sử giao dịch/đăng ký
  // GET /api/vip/history
  // ----------------------------------------------------------------
  static async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const history = await VIPService.getSubscriptionHistory(userId);

      return res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      console.error('[VIPController] getHistory Error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi lấy lịch sử giao dịch' });
    }
  }

  // ----------------------------------------------------------------
  // 4. Hủy gói VIP (Tắt gia hạn hoặc Hủy ngay lập tức tùy logic)
  // POST /api/vip/cancel
  // ----------------------------------------------------------------
  static async cancelSubscription(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      
      const result = await VIPService.cancelSubscription(userId);

      return res.json({
        success: true,
        message: 'Đã hủy gói VIP thành công',
        data: result
      });
    } catch (error: any) {
      console.error('[VIPController] cancelSubscription Error:', error);
      
      if (error.message === 'No active subscription found') {
        return res.status(404).json({ success: false, message: 'Bạn không có gói VIP nào đang hoạt động' });
      }

      return res.status(500).json({ success: false, message: 'Lỗi khi hủy gói' });
    }
  }
}