import { Response } from 'express';
import { getAiResponse } from '../services/gemini.service';
import { generateFortunePrompt } from '../services/ai-prompts.service';
import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getFortune(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { mode, selectedDate, userContext } = req.body;

    const fullUserContext = {
      ...userContext,
      selectedDate
    };

    let prompt = generateFortunePrompt(mode as 'comprehensive' | 'daily' | 'yearly', fullUserContext);
    
    if (fullUserContext?.isInBreakup) {
      prompt = addBreakupContextToPrompt(prompt, fullUserContext);
    }
    
    let analysis = await getAiResponse(prompt);
    
    if (fullUserContext?.isInBreakup) {
      const comfortingMsg = getComfortingMessage('fortune');
      analysis += `\n\n${comfortingMsg}`;
    }

    res.status(200).json({ analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
