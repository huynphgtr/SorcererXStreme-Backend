import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatService {
  static async getOrCreateDailySession(userId: string): Promise<string> {
    // Lấy thời điểm hiện tại theo giờ Việt Nam để tính toán mốc bắt đầu/kết thúc ngày
    const now = new Date();
    const vnTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
    const vnNow = new Date(vnTimeStr);

    const startOfDay = new Date(vnNow);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(vnNow);
    endOfDay.setHours(23, 59, 59, 999);

    // Tìm session của ngày hôm nay (tính theo giờ VN)
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: { id: true }
    });

    if (existingSession) return existingSession.id;

    const dateString = vnNow.toLocaleDateString('vi-VN');
    const newSession = await prisma.chatSession.create({
      data: {
        user_id: userId,
        title: `Phiên chat ngày ${dateString}`,
        // Ép Prisma lưu thời gian hiện tại của App (đã set TZ) thay vì dùng default của DB
        created_at: now 
      },
      select: { id: true }
    });

    return newSession.id;
  }

  static async saveNewMessages(
    sessionId: string,
    userId: string,
    userMessage: string, 
    aiResponse: string
  ): Promise<void> {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updated_at: new Date() } // Sử dụng thời gian hiện tại của server
    });
  }
}