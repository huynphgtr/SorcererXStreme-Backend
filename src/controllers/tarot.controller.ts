import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';
import { AIService } from '../services/ai.service';

interface UserContext {
  name?: string;
  gender?: string;
  birth_date?: string;
  [key: string]: any;
}

interface TarotCard {
  name: string;
  is_upright: boolean;
  position?: string;
}

function validateRequiredFields(ctx: any, label: string): string | null {
  if (!ctx) return `Missing ${label} object`;
  
  const required = ['name', 'gender', 'birth_date'];
  const missing = required.find(field => !ctx[field] || ctx[field].toString().trim() === '');

  if (missing) return `Field '${missing}' is required in ${label}`;
  return null;
}

async function handleTarotLogic(
  params: {
    mode: 'overview' | 'question';
    question?: string;
    cardsDrawn: TarotCard[];
    userContext: UserContext;
    partnerContext?: UserContext;
  }
) {
  const { mode, question, cardsDrawn, userContext, partnerContext } = params;

  // 1. Chuẩn bị Payload cho Python AI
  const aiPayload = {
    domain: "tarot",
    feature_type: mode,
    user_context: userContext,
    partner_context: partnerContext || null,
    data: {
      question: question || null,
      cards_drawn: cardsDrawn.map(c => ({
        card_name: c.name,
        is_upright: c.is_upright,
        position: c.position
      }))
    }
  };
  const aiResponse = await AIService.callMysticEndpoint(aiPayload);

  // 3. Handle VIP Usage (Chỉ chạy khi AI thành công)
  // try {
  //   await VIPService.incrementUsage(userId, 'tarot');
  // } catch (usageError) {
  //   console.warn('Failed to increment usage counter:', usageError);
  // }
  return aiResponse;
}

export async function processTarotRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context, partner_context, data } = req.body ?? {};

    // --- A. Validate Meta Data ---
    if (domain !== 'tarot') {
      res.status(400).json({ message: 'Invalid domain (expected "tarot")' });
      return;
    }

    if (feature_type !== 'overview' && feature_type !== 'question') {
      res.status(400).json({ message: "Invalid feature_type. Expected 'overview' or 'question'" });
      return;
    }

    // --- B. Validate Contexts ---
    // 1. User Context: Bắt buộc
    const userError = validateRequiredFields(user_context, 'user_context');
    if (userError) {
      res.status(400).json({ message: userError });
      return;
    }

    // 2. Partner Context: Optional (Nhưng nếu có thì phải Valid)
    if (partner_context) {
      const partnerError = validateRequiredFields(partner_context, 'partner_context');
      if (partnerError) {
        res.status(400).json({ message: partnerError });
        return;
      }
    }

    // --- C. Validate Data & Cards ---
    if (!data) {
        res.status(400).json({ message: 'Data object is required' });
        return;
    }

    const rawCards = data.cards_drawn;
    if (!Array.isArray(rawCards) || rawCards.length === 0) {
      res.status(400).json({ message: 'cards_drawn array is required and cannot be empty' });
      return;
    }

    // Chuẩn hóa cards (xử lý trường hợp 'card_name' vs 'name')
    const processedCards: TarotCard[] = rawCards.map((c: any, index: number) => {
        const name = c.card_name ?? c.name; 
        if (!name) {
            throw new Error(`Card at index ${index} is missing a name`);
        }
        return {
            name: name,
            is_upright: Boolean(c.is_upright), 
            position: c.position ?? undefined
        };
    });

    // --- D. Mode Specific Logic ---
    let mode: 'overview' | 'question' = 'overview';
    let questionString = '';

    if (feature_type === 'question') {
        mode = 'question';
        questionString = data.question;
        
        if (!questionString || typeof questionString !== 'string' || questionString.trim() === '') {
            res.status(400).json({ message: 'Question is required for question mode' });
            return;
        }
    } else {
        mode = 'overview';
    }

    // --- E. Process Logic ---
    const result = await handleTarotLogic({
      mode: mode,
      question: questionString,
      cardsDrawn: processedCards,
      userContext: user_context,
      partnerContext: partner_context ?? undefined
    });
    res.status(200).json(result);

  } catch (error: any) {
    if (error.message && error.message.includes('Card at index')) {
        res.status(400).json({ message: error.message });
        return;
    }
    console.error('Error in processTarotRequest:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}