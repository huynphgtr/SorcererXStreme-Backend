import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAiResponse } from '../services/gemini.service';
import { generateTarotPrompt } from '../services/tarot-prompts.service';
import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';

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

    // const reading = await prisma.tarotReading.create({
    //   data: {
    //     userId,
    //     question,
    //     cardsDrawn,
    //     interpretation,
    //   },
    // });

    res.status(200).json({ interpretation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
