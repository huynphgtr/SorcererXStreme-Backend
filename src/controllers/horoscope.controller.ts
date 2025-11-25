import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';
import { AIService } from '../services/ai.service';
// import { getAiResponse } from '../services/gemini.service';
// import { generateHoroscopePrompt } from '../services/ai-prompts.service';


interface HoroscopeContext {
  name?: string;
  gender?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  [key: string]: any;
}

function validateRequiredFields(ctx: any): string | null {
  if (!ctx) return 'Missing user_context object';
  
  const required = ['name', 'gender', 'birth_date', 'birth_time', 'birth_place'];
  const missing = required.find(field => !ctx[field] || ctx[field].toString().trim() === '');

  if (missing) return `Field '${missing}' is required in user_context for Horoscope`;
  return null;
}

async function handleHoroscopeLogic(
  userId: string,
  res: Response,
  params: {
    mode: 'daily' | 'natal_chart';
    targetDate?: string;
    userContext: HoroscopeContext;
  }
) {
  const { mode, targetDate, userContext } = params;

  const payload = {
    userId,
    domain: 'Horoscope',
    feature_type: mode,
    target_date: targetDate || null, 
    processedData: {
      user: userContext
    }
  };
  const aiResponse = await AIService.callMysticEndpoint(payload);
  // 3. Handle VIP Usage 
  // try {
  //   await VIPService.incrementUsage(userId, 'astrology');
  // } catch (usageError) {
  //   console.warn('Failed to increment usage counter:', usageError);
  // }
  return aiResponse;
}

export async function getHoroscope(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context, data } = req.body ?? {};

    if (domain !== 'horoscope') {
      res.status(400).json({ message: 'Invalid domain (expected "horoscope")' });
      return;
    }

    if (feature_type !== 'daily' && feature_type !== 'natal_chart') {
      res.status(400).json({ message: 'Invalid feature_type. Expected "daily" or "natal_chart"' });
      return;
    }

    // --- C. Validate User Context (Bắt buộc cho cả 2 mode) ---
    const userError = validateRequiredFields(user_context);
    if (userError) {
      res.status(400).json({ message: userError });
      return;
    }

    // --- D. Validate Logic theo Mode ---
    let targetDateString: string | undefined = undefined;

    if (feature_type === 'daily') {
      if (!data || !data.target_date || typeof data.target_date !== 'string') {
        res.status(400).json({ message: 'target_date is required in data for daily Horoscope' });
        return;
      }
      targetDateString = data.target_date;
    } 

    const result = await handleHoroscopeLogic(userId, res, {
      mode: feature_type, 
      targetDate: targetDateString,
      userContext: user_context
    });

    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error in getHoroscope:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}