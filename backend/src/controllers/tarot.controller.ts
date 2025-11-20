import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAiResponse } from '../services/gemini.service';
import { generateTarotPrompt } from '../services/tarot-prompts.service';
import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';

const prisma = new PrismaClient();

export async function getTarotReading(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { question, cardsDrawn, mode = 'question', userContext } = req.body;

    let prompt = generateTarotPrompt(mode, question || '', cardsDrawn, userContext);
    
    if (userContext?.isInBreakup) {
      prompt = addBreakupContextToPrompt(prompt, userContext);
    }

    let interpretation = await getAiResponse(prompt);
    
    if (userContext?.isInBreakup) {
      const comfortingMsg = getComfortingMessage('tarot');
      interpretation += `\n\n${comfortingMsg}`;
    }

    // Increment usage counter (don't fail if this errors)
    try {
      await VIPService.incrementUsage(userId, 'tarot');
    } catch (usageError) {
      console.warn('Failed to increment usage counter:', usageError);
      // Continue anyway - don't fail the request
    }

    // Save to database (don't fail if this errors)
    try {
      const reading = await prisma.tarotReading.create({
        data: {
          userId,
          question: question || '',
          cardsDrawn: Array.isArray(cardsDrawn) ? cardsDrawn.join(', ') : cardsDrawn,
          interpretation,
        },
      });
    } catch (dbError: any) {
      console.warn('Failed to save tarot reading to database:', dbError.message);
      // Continue anyway - don't fail the request
    }

    res.status(200).json({ interpretation });
  } catch (error: any) {
    console.error('Tarot controller error:', error);
    const errorMessage = error.message || 'Internal server error';
    res.status(500).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
}
