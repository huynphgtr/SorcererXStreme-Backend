import { Response } from 'express';
import { getAiResponse } from '../services/gemini.service';
import { generateAstrologyPrompt } from '../services/ai-prompts.service';
import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';

export async function getAstrology(req: AuthRequest, res: Response): Promise<void> {
  try {
    console.log('[Astrology] Request received');
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { mode, birthDate, birthTime, birthPlace, userContext } = req.body;
    console.log('[Astrology] Request data:', { mode, birthDate, birthTime, birthPlace, hasUserContext: !!userContext });

    const fullUserContext = {
      ...userContext,
      birthDate,
      birthTime,
      birthPlace
    };

    let prompt = generateAstrologyPrompt(mode, fullUserContext);
    console.log('[Astrology] Prompt generated, calling Gemini API...');
    
    if (fullUserContext?.isInBreakup) {
      prompt = addBreakupContextToPrompt(prompt, fullUserContext);
    }
    
    let analysis = await getAiResponse(prompt);
    console.log('[Astrology] Got AI response, length:', analysis.length);
    
    if (fullUserContext?.isInBreakup) {
      const comfortingMsg = getComfortingMessage('astrology');
      analysis += `\n\n${comfortingMsg}`;
    }

    // Increment usage counter (don't fail if this errors)
    try {
      await VIPService.incrementUsage(userId, 'astrology');
    } catch (usageError: any) {
      console.warn('Failed to increment usage counter:', usageError.message);
      // Continue anyway - don't fail the request
    }

    console.log('[Astrology] Sending response to client');
    res.status(200).json({ analysis });
  } catch (error: any) {
    console.error('[Astrology] Controller error:', error);
    console.error('[Astrology] Error stack:', error.stack);
    const errorMessage = error.message || 'Internal server error';
    res.status(500).json({ 
      message: errorMessage,
      error: error.message 
    });
  }
}
