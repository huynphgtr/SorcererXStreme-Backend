import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ChatService {
  static async getOrCreateDailySession(userId: string): Promise<string> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

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

    const dateString = new Date().toLocaleDateString('vi-VN');
    const newSession = await prisma.chatSession.create({
      data: {
        user_id: userId,
        title: `Phiên chat ngày ${dateString}`,
      },
      select: { id: true }
    });

    return newSession.id;
  }

  static async createSession(userId: string, initialTitle: string = "New Chat"): Promise<string> {
    const newSession = await prisma.chatSession.create({
      data: { user_id: userId, title: initialTitle },
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
    const now = new Date();
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updated_at: now }
    });
  }
}