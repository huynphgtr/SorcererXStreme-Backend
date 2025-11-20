import { Response } from 'express';
import { getAiResponse } from '../services/gemini.service';
import { generateNumerologyPrompt } from '../services/ai-prompts.service';
import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';

export async function getNumerology(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { mode, name, birthDate, numbers, type, userContext } = req.body;

    const fullUserContext = {
      ...userContext,
      name,
      birthDate
    };

    let prompt = generateNumerologyPrompt(
      numbers || birthDate, 
      (type || mode) as 'life_path' | 'destiny' | 'personality' | 'soul_urge' | 'full_analysis' | 'love',
      fullUserContext
    );
    
    if (fullUserContext?.isInBreakup) {
      prompt = addBreakupContextToPrompt(prompt, fullUserContext);
    }
    
    let analysis = await getAiResponse(prompt);
    
    if (fullUserContext?.isInBreakup) {
      const comfortingMsg = getComfortingMessage('numerology');
      analysis += `\n\n${comfortingMsg}`;
    }

    // Increment usage counter (don't fail if this errors)
    try {
      await VIPService.incrementUsage(userId, 'numerology');
    } catch (usageError) {
      console.warn('Failed to increment usage counter:', usageError);
      // Continue anyway - don't fail the request
    }

    res.status(200).json({ analysis });
  } catch (error: any) {
    console.error('Numerology controller error:', error);
    const errorMessage = error.message || 'Internal server error';
    res.status(500).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
}
