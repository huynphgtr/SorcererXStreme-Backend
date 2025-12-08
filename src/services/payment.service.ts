// services/PaymentService.ts
import { PrismaClient } from '@prisma/client';
import { VIPTier, SubscriptionStatus, BANK_CONFIG } from '../types/vip.types';

const prisma = new PrismaClient();

interface WebhookParams {
  content: string;
  amount: number;
  paymentDate?: string; 
}


export class PaymentService {
  
  // ----------------------------------------------------------------
  // 1. TẠO YÊU CẦU THANH TOÁN (Generate QR)
  // ----------------------------------------------------------------
  static async createPaymentRequest(userId: string, tier: VIPTier, price: number, durationMonths: number) {
    // Tạo mã giao dịch duy nhất
    // const transactionCode = `${BANK_CONFIG.TX_PREFIX}${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    const uniqueSuffix = Date.now().toString().slice(-6); 
    const transactionCode = `${BANK_CONFIG.TX_PREFIX}${uniqueSuffix}`;

    // Tạo QR Link
    const qrUrl = `https://qr.sepay.vn/img?acc=${BANK_CONFIG.ACCOUNT_NO}&bank=${BANK_CONFIG.BANK_ID}&amount=${price}&des=${transactionCode}`;
    // Tính ngày end tạm (để lưu DB)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Lưu vào DB trạng thái PENDING
    // const subscription = await prisma.subscription.create({
    //   data: {
    //     user_id: userId,
    //     tier,
    //     price,
    //     start_date: startDate,
    //     end_date: endDate,
    //     status: SubscriptionStatus.PENDING,
    //     payment_method: 'BANK_TRANSFER_QR',
    //     transaction_id: transactionCode
    //   }
    // });

    const subscription = await prisma.subscription.create({
      data: {
        user_id: userId,
        tier,
        price,
        start_date: startDate,
        end_date: endDate,
        status: SubscriptionStatus.PENDING,
        payment_method: 'BANK_TRANSFER_QR',
        transaction_id: transactionCode
      }
    });

    return {
      transactionCode,
      amount: price,
      qrUrl,
      subscriptionId: subscription.id
    };
  }

  // ----------------------------------------------------------------
  // 2. XỬ LÝ WEBHOOK TỪ NGÂN HÀNG
  // ----------------------------------------------------------------
  static async processWebhook({ content, amount, paymentDate }: WebhookParams) {
    console.log(`[Webhook] Processing: ${content} - Amount: ${amount} - Date: ${paymentDate}`);

    // A. Tìm transactionCode
    const regex = new RegExp(`${BANK_CONFIG.TX_PREFIX}\\d+`, 'i');
    const match = content.match(regex);

    if (!match) {
      return { success: false, reason: 'No transaction code found' };
    }
    const transactionCode = match[0].toUpperCase();

    // B. Tìm đơn hàng
    const subscription = await prisma.subscription.findFirst({
      where: {
        transaction_id: transactionCode,
        status: SubscriptionStatus.PENDING
      }
    });
    if (!subscription) {
      return { success: false, reason: 'Transaction invalid or processed' };
    }

    // C. Kiểm tra số tiền
    if (amount < subscription.price) {
      return { success: false, reason: 'Insufficient amount' };
    }

    // D. Xử lý logic thời gian (QUAN TRỌNG)
    // Nếu SePay gửi ngày, dùng ngày đó. Nếu không, dùng giờ server hiện tại.
    const actualPaymentTime = paymentDate ? new Date(paymentDate) : new Date();

    // E. Transaction DB
    await prisma.$transaction(async (tx) => {
      // Lấy thông tin user hiện tại để tính cộng dồn
      const user = await tx.user.findUnique({ where: { id: subscription.user_id } });
      
      // Tính thời lượng gói (duration)
      const durationMs = subscription.end_date.getTime() - subscription.start_date.getTime();

      let newExpiresAt = new Date();

      if (user?.is_vip && user.vip_expires_at && user.vip_expires_at > actualPaymentTime) {
        // Trường hợp 1: User đang còn hạn VIP -> Cộng nối tiếp vào ngày hết hạn cũ
        newExpiresAt = new Date(user.vip_expires_at.getTime() + durationMs);
      } else {
        // Trường hợp 2: User hết hạn hoặc mới mua lần đầu -> Tính từ thời điểm thanh toán thực tế
        newExpiresAt = new Date(actualPaymentTime.getTime() + durationMs);
      }

      // 1. Update Subscription (Lưu lịch sử chính xác)
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          start_date: actualPaymentTime, // Cập nhật lại ngày bắt đầu theo thực tế chuyển tiền
          end_date: newExpiresAt
        }
      });

      // 2. Update User
      await tx.user.update({
        where: { id: subscription.user_id },
        data: {
          is_vip: true,
          vip_tier: subscription.tier,
          vip_expires_at: newExpiresAt
        }
      });
    });

    return { success: true, transactionCode };
  }
}