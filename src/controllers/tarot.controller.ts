import { Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import { getAiResponse } from '../services/gemini.service';
import { generateTarotPrompt } from '../services/tarot-prompts.service';
// import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';

// const prisma = new PrismaClient();

async function handleTarotLogic(
  userId: string,
  res: Response,
  params: {
    mode: 'overview' | 'question';
    question: string;
    cardsDrawn: any[];
    userContext?: any;
    partnerContext?: any;
  }
) {
  const { mode, question, cardsDrawn, userContext, partnerContext } = params;

  // 1. Generate Prompt
  // let prompt = generateTarotPrompt(mode, question, cardsDrawn, userContext);
  // if (userContext?.isInBreakup) {
  //   prompt = addBreakupContextToPrompt(prompt, userContext);
  // }
  // 2. Call AI
  // let interpretation = await getAiResponse(prompt);
  // 3. Handle VIP Usage
  try {
    await VIPService.incrementUsage(userId, 'tarot');
  } catch (usageError) {
    console.warn('Failed to increment usage counter:', usageError);
  }
  // 5. Response
  // res.status(200).json({ interpretation });

  const payload = { userId, mode, question, cardsDrawn, userContext, partnerContext };
  // console.log('[Tarot] handleTarotLogic payload:', JSON.stringify(payload, null, 2));
  res.status(200).json({ message: 'Payload received', payload });
}

export async function getTarotOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context, partner_context, data } = req.body ?? {};

    if (domain !== 'tarot') {
      res.status(400).json({ message: 'Invalid domain (expected "tarot")' });
      return;
    }

    if (feature_type && feature_type !== 'tarot_overview') {
      res.status(400).json({ message: 'Invalid feature_type for this endpoint' });
      return;
    }

    const cardsDrawn = data?.cards_drawn;
    if (!Array.isArray(cardsDrawn) || cardsDrawn.length === 0) {
      res.status(400).json({ message: 'cards_drawn are required in data' });
      return;
    }

    await handleTarotLogic(userId, res, {
      mode: 'overview',
      question: '',
      cardsDrawn,
      userContext: user_context ?? undefined,
      partnerContext: partner_context ?? undefined
    });

  } catch (error) {
    console.error('Error in getTarotOverview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getTarotQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context, partner_context, data } = req.body ?? {};

    if (domain !== 'tarot') {
      res.status(400).json({ message: 'Invalid domain (expected "tarot")' });
      return;
    }
    
    if (feature_type && feature_type !== 'tarot_question') {
      res.status(400).json({ message: 'Invalid feature_type for this endpoint' });
      return;
    }

    const question = data?.question;
    const rawCards = data?.cards_drawn;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      res.status(400).json({ message: 'Question is required for this reading mode' });
      return;
    }

    if (!Array.isArray(rawCards) || rawCards.length === 0) {
      res.status(400).json({ message: 'cards_drawn are required in data' });
      return;
    }

    const cardsDrawn = rawCards.map((c: any) => {
      const name = c.card_name ?? c.name;
      return {
        name,
        is_upright: Boolean(c.is_upright),
        position: c.position ?? undefined,
      };
    });

    if (cardsDrawn.some((c: any) => !c.name)) {
      res.status(400).json({ message: 'Each card must include a name (card_name)' });
      return;
    }

    await handleTarotLogic(userId, res, {
      mode: 'question',
      question,
      cardsDrawn,
      userContext: user_context ?? undefined,
      partnerContext: partner_context ?? undefined
    });

  } catch (error) {
    console.error('Error in getTarotQuestion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}