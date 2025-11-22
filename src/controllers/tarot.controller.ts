import { Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import { getAiResponse } from '../services/gemini.service';
import { generateTarotPrompt } from '../services/tarot-prompts.service';
// import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';

// const prisma = new PrismaClient();

// --- Helper Function (Private) ---
async function handleTarotLogic(
  userId: string,
  res: Response,
  params: {
    mode: 'overview' | 'question';
    question: string;
    cardsDrawn: any[];
    userContext?: any;
  }
) {
  const { mode, question, cardsDrawn, userContext } = params;

  // 1. Generate Prompt
  let prompt = generateTarotPrompt(mode, question, cardsDrawn, userContext);

  // if (userContext?.isInBreakup) {
  //   prompt = addBreakupContextToPrompt(prompt, userContext);
  // }

  // 2. Call AI
  let interpretation = await getAiResponse(prompt);

  // 3. Handle VIP Usage
  try {
    await VIPService.incrementUsage(userId, 'tarot');
  } catch (usageError) {
    console.warn('Failed to increment usage counter:', usageError);
  }

  // 5. Response
  res.status(200).json({ interpretation });
}
// --- Main Controllers ---
export async function getTarotOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { cardsDrawn, userContext } = req.body;

    if (!cardsDrawn || cardsDrawn.length === 0) {
      res.status(400).json({ message: 'Cards drawn are required' });
      return;
    }
    
    await handleTarotLogic(userId, res, {
      mode: 'overview',
      question: '', 
      cardsDrawn,
      userContext
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

    const { question, cardsDrawn, userContext } = req.body;

    // Validate bắt buộc phải có câu hỏi
    if (!question || typeof question !== 'string' || question.trim() === '') {
      res.status(400).json({ message: 'Question is required for this reading mode' });
      return;
    }

    if (!cardsDrawn || cardsDrawn.length === 0) {
      res.status(400).json({ message: 'Cards drawn are required' });
      return;
    }

    // Gọi hàm xử lý chung với mode là 'question'
    await handleTarotLogic(userId, res, {
      mode: 'question',
      question,
      cardsDrawn,
      userContext
    });

  } catch (error) {
    console.error('Error in getTarotQuestion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
