import { Response } from 'express';
import { getAiResponse } from '../services/gemini.service';
import { generateAstrologyPrompt } from '../services/ai-prompts.service';
import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getAstrology(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { mode, birthDate, birthTime, birthPlace, userContext } = req.body;

    const fullUserContext = {
      ...userContext,
      birthDate,
      birthTime,
      birthPlace
    };

    let prompt = generateAstrologyPrompt(mode, fullUserContext);
    
    if (fullUserContext?.isInBreakup) {
      prompt = addBreakupContextToPrompt(prompt, fullUserContext);
    }
    
    let analysis = await getAiResponse(prompt);
    
    if (fullUserContext?.isInBreakup) {
      const comfortingMsg = getComfortingMessage('astrology');
      analysis += `\n\n${comfortingMsg}`;
    }

    res.status(200).json({ analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
