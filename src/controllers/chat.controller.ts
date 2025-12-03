import { Request, Response } from 'express';
import { VIPService } from '../services/vip.service';
import { ChatService } from '../services/chat.service'; 
import { AIService } from '../services/ai.service';

// Interface cho Request có user (đã qua middleware auth)
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

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

export async function sendMessage(params: {
  mode: 'question';
  userContext: ChatContext;
  partnerContext?: ChatContext;
  userId: string;
  sessionId: string;
  question: string;
}) {
  const { mode, userContext, partnerContext, sessionId, question, userId } = params;

  // 1. Chuẩn bị payload gửi cho AI Service
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
    // 3. Gọi AI Service
    const aiResponseContent = await AIService.sendChatMessage(aiPayload);
    return {
      // sessionId,
      // question,
      answer: aiResponseContent
    };
  } catch (error) {
    console.error('Error inside sendMessage:', error);
    throw error; 
  }
}

export async function createNewSession(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { initialTitle } = req.body;
    const sessionId = await ChatService.createSession(userId, initialTitle);
    res.status(201).json({ sessionId: sessionId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating session' });
  }
}

export async function processMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context, partner_context, data } = req.body ?? {};
    
    const sessionId = data?.sessionId;
    const question = data?.question;

    if (!sessionId) {
      res.status(400).json({ message: 'Invalid sessionId in data object' });
      return;
    }

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
    if (partner_context) {
      const partnerError = validateRequiredFields(partner_context, 'partner_context');
      if (partnerError) {
        res.status(400).json({ message: partnerError });
        return;
      }
    }

    // ==================================================================
    // 4. VIP CHECK: Kiểm tra giới hạn Chat
    // ==================================================================
    const accessCheck = await VIPService.checkFeatureAccess(userId, 'chatMessagesPerDay');

    if (!accessCheck.allowed) {
       res.status(403).json({
        success: false,
        code: 'LIMIT_REACHED',
        message: 'Bạn đã hết lượt chat với AI trong ngày.',
        data: {
          tier: accessCheck.tier,
          limit: accessCheck.limit,
          currentUsage: accessCheck.currentUsage
        }
      });
      return;
    }

    // ==================================================================
    // 5. PROCESS LOGIC: Gọi hàm xử lý tin nhắn
    // ==================================================================
    const result = await sendMessage({
      mode: feature_type,
      userContext: user_context,
      partnerContext: partner_context ?? undefined,
      userId: userId,
      sessionId: sessionId,
      question: question,
    });

    // ==================================================================
    // 6. INCREMENT USAGE: Tăng lượt sử dụng sau khi thành công
    // ==================================================================
    await VIPService.incrementUsage(userId, 'chat');
    res.status(200).json({
      success: true,
      data: result,
      usage: {
        current: (accessCheck.currentUsage || 0) + 1,
        limit: accessCheck.limit
      }
    });

  } catch (error: any) {
    console.error('Process message error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}