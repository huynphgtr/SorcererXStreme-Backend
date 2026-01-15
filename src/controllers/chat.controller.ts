import { Request, Response } from 'express';
import { VIPService } from '../services/vip.service';
import { ChatService } from '../services/chat.service';
import { AIService } from '../services/ai.service';

interface ChatContext {
  name?: string;
  gender?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  [key: string]: any;
}

function validateRequiredFields(ctx: any, label: string): string | null {
  if (!ctx) return `Missing ${label} object`;
  const required = ['name', 'birth_date', 'birth_time', 'gender'];
  const missing = required.find(field => !ctx[field] || ctx[field].toString().trim() === '');
  if (missing) return `Field '${missing}' is required in ${label}`;
  return null;
}

export async function createNewSession(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { initialTitle } = req.body;
    const sessionId = await ChatService.getOrCreateDailySession(userId);
    res.status(201).json({ sessionId: sessionId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating session' });
  }
}

export async function sendMessage(params: {
  mode: 'question';
  userContext: ChatContext;
  partnerContext?: ChatContext;
  userId: string;
  sessionId: string;
  question: string;
}) {
  const { mode, userContext, partnerContext, sessionId, question } = params;

  const aiPayload = {
    domain: "chatbot",
    feature_type: mode,
    user_context: userContext,
    partner_context: partnerContext ?? null,
    data: {
      sessionId: sessionId,
      question: question,
    }
  };

  try {
    const aiResponseContent = await AIService.sendChatMessage(aiPayload);
    const bodyString = aiResponseContent?.data?.answer?.body || aiResponseContent?.answer?.body || aiResponseContent?.body;

    if (!bodyString) {
      console.warn("Không tìm thấy body trong phản hồi của AI Service", aiResponseContent);
      return "Không nhận được phản hồi phù hợp.";
    }

    const parsedBody = JSON.parse(bodyString);
    return parsedBody.reply;
  } catch (error) {
    console.error('Error inside sendMessage:', error);
    throw error;
  }
}

export async function processMessage(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context, partner_context, data } = req.body ?? {};
    const question = data?.question;

    // 1. Validation cơ bản
    if (!question || question.toString().trim() === '') {
      res.status(400).json({ message: 'Question cannot be empty' });
      return;
    }
    if (domain !== 'chatbot') {
      res.status(400).json({ message: 'Invalid domain' });
      return;
    }
    if (feature_type !== 'question') {
      res.status(400).json({ message: "Invalid feature_type. Expected 'question'" });
      return;
    }

    const userError = validateRequiredFields(user_context, 'user_context');
    if (userError) {
      res.status(400).json({ message: userError });
      return;
    }

    // 2. Tự động lấy/tạo sessionId theo ngày (đã xử lý múi giờ VN trong service)
    const sessionId = await ChatService.getOrCreateDailySession(userId);

    // 3. Kiểm tra quyền truy cập VIP/Limit
    const accessCheck = await VIPService.checkFeatureAccess(userId, 'chatMessagesPerDay');
    if (!accessCheck.allowed) {
      res.status(403).json({
        success: false,
        code: 'LIMIT_REACHED',
        message: 'Bạn đã hết lượt chat với AI trong ngày.',
        data: accessCheck
      });
      return;
    }

    // 4. Gửi tin nhắn cho AI
    const result = await sendMessage({
      mode: feature_type as 'question',
      userContext: user_context,
      partnerContext: partner_context ?? undefined,
      userId: userId,
      sessionId: sessionId,
      question: question,
    });

    // 5. Lưu vết và tăng lượt sử dụng
    await ChatService.saveNewMessages(sessionId, userId, question, result);
    await VIPService.incrementUsage(userId, 'chat');

    res.status(200).json({ data: result });

  } catch (error: any) {
    console.error('Process message error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}