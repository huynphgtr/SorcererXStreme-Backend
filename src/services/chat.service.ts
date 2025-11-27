// services/chat.service.ts
import { PrismaClient } from '@prisma/client';
// Giả lập Dịch vụ DynamoDB (thay thế cho AWS SDK)
// import { mockDynamoDBClient } from './dynamodb.service.mock'; 

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const prisma = new PrismaClient();

export class ChatService {
  /**
   * Lấy lịch sử tin nhắn chi tiết từ DynamoDB để làm ngữ cảnh.
   * @param sessionId ID của phiên chat.
   * @returns Mảng các tin nhắn (lịch sử đã được tinh gọn).
   */
  static async getContextHistory(sessionId: string): Promise<Message[]> {
    // 1. Lấy tất cả tin nhắn cũ (giả lập DynamoDB Query)
    // const rawHistory = await mockDynamoDBClient.getMessages(sessionId); 

    // 2. Logic: Tinh gọn lịch sử để tránh vượt quá giới hạn Token context của LLM
    // const MAX_CONTEXT_MESSAGES = 10;
    
    // Trả về lịch sử đã được tinh gọn (5 tin nhắn cuối)
    return []; 
  }

  /**
   * Lưu tin nhắn mới và phản hồi của AI vào DynamoDB và cập nhật timestamp RDS.
   */
  static async saveNewMessages(
    sessionId: string,
    userId: string,
    userMessage: string, 
    aiResponse: string
  ): Promise<void> {
    const now = new Date();

    // 1. Ghi 2 tin nhắn (User và AI) vào DynamoDB
    // await mockDynamoDBClient.putMessages(sessionId, [
    //   { role: 'user', content: userMessage, timestamp: now },
    //   { role: 'assistant', content: aiResponse, timestamp: now }
    // ]);

    // 2. Cập nhật metadata trong RDS (cập nhật timestamp "updated_at" và title nếu cần)
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updated_at: now }
    });
  }

  static async createSession(userId: string, initialTitle: string = "New Chat"): Promise<string> {
    const newSession = await prisma.chatSession.create({
      data: {
        user_id: userId,
        title: initialTitle,
      },
      select: { id: true }
    });
    return newSession.id;
  }
}