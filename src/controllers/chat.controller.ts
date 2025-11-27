import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';
import { ChatService } from '../services/chat.service';


interface ChatPayload {
    sessionId: string;
    message: string;
}

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
    const { sessionId, message }: ChatPayload = req.body;
    const userId = req.user?.id; 

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: User ID not found in token.' });
      return;
    }

    if (!sessionId || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ message: 'Invalid sessionId or message content is required.' });
      return;
    }

    try {
        // 1. Kiểm tra Trạng thái VIP và Giới hạn Sử dụng
        // const isVip = await VIPService.isVip(userId);
        // let usageCheck: { success: boolean, remaining: number | null } = { success: true, remaining: null };

        // if (!isVip) {
        //     // Logic kiểm tra và trừ lượt sử dụng cho người dùng FREE
        //     usageCheck = await VIPService.incrementUsage(userId, 'chat');
            
        //     if (!usageCheck.success) {
        //         return res.status(403).json({
        //             message: 'Hết lượt chat miễn phí hôm nay. Vui lòng nâng cấp gói VIP.',
        //             code: 'USAGE_LIMIT_EXCEEDED'
        //         });
        //     }
        // }
        
        // 2. Lấy Ngữ cảnh (Lịch sử chat)
        // Lấy lịch sử tin nhắn chi tiết từ DynamoDB để duy trì ngữ cảnh
        // const contextHistory = await ChatService.getContextHistory(sessionId);
        
        // 3. Gửi sang AI Server và Nhận Phản hồi
        // const aiResponseContent = await mockAIService.generateResponse(
        //     message,
        //     contextHistory, // Truyền lịch sử vào hàm AI
        //     // isVip
        //     false
        // );
        
        // 4. Lưu tin nhắn mới và Phản hồi AI vào DynamoDB & Cập nhật timestamp RDS
        // await ChatService.saveNewMessages(
        //     sessionId,
        //     userId, // Cần User ID để lưu aiResponse (cho audit log)
        //     message,
        //     aiResponseContent
        // );

        // 5. Trả về Phản hồi
        res.status(200).json({ 
            note: 'Chat service is under maintenance. AI response functionality is temporarily disabled.',
            sessionId: sessionId,
            message: message,
            // response: aiResponseContent, 
            // isVip: isVip,
            // remainingUses: usageCheck.remaining
        });

    } catch (error) {
        console.error('Lỗi xử lý tin nhắn:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createNewSession(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { initialTitle } = req.body;
  const sessionId = await ChatService.createSession(userId, initialTitle);
  res.status(201).json({ sessionId: sessionId });
}
