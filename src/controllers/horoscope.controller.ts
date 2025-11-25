import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';
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

  // --- A. Generate Prompt & Call AI ---
  // const prompt = generateHoroscopePrompt(mode, userContext, targetDate);
  // const analysis = await getAiResponse(prompt);

  // --- B. Handle VIP Usage ---
  try {
    await VIPService.incrementUsage(userId, 'Horoscope');
  } catch (usageError) {
    console.warn('VIP usage error:', usageError);
  }

  // --- C. Return Response ---
  // res.status(200).json({ analysis });

  // DEBUG RESPONSE: Trả về payload để verify
  const payload = {
    userId,
    domain: 'Horoscope',
    feature_type: mode,
    target_date: targetDate || null, 
    processedData: {
      user: userContext
    }
  };

  res.status(200).json({ 
    message: 'Horoscope payload received and processed successfully', 
    payload 
  });
}

export async function getHoroscope(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context, data } = req.body ?? {};

    // --- A. Validate Domain ---
    // Payload mẫu dùng domain là "horoscope"
    if (domain !== 'horoscope') {
      res.status(400).json({ message: 'Invalid domain (expected "horoscope")' });
      return;
    }

    // --- B. Validate Feature Type ---
    // Chỉ chấp nhận 2 mode: daily, natal_chart
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

    // --- E. Process Logic ---
    await handleHoroscopeLogic(userId, res, {
      mode: feature_type, 
      targetDate: targetDateString,
      userContext: user_context
    });

  } catch (error) {
    console.error('Error in getHoroscope:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}