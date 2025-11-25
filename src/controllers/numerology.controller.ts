import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';
// import { getAiResponse } from '../services/gemini.service';
// import { generateNumerologyPrompt } from '../services/ai-prompts.service';

interface NumerologyContext {
  name?: string;
  gender?: string;
  birth_date?: string;
  [key: string]: any;
}

function validateNumerologyFields(ctx: any): string | null {
  if (!ctx) return 'Missing user_context object';
  
  const required = ['name', 'birth_date', 'gender'];
  const missing = required.find(field => !ctx[field] || ctx[field].toString().trim() === '');

  if (missing) return `Field '${missing}' is required in user_context for Numerology`;
  return null;
}

async function handleNumerologyLogic(
  userId: string,
  res: Response,
  params: {
    userContext: NumerologyContext;
  }
) {
  const { userContext } = params;

  // --- 1. Prepare Data ---
  // const birthDate = userContext.birth_date;
  // const name = userContext.name;

  // --- 2. Call AI ---
  // let prompt = generateNumerologyPrompt(birthDate, 'life_path', userContext);
  // let analysis = await getAiResponse(prompt);

  // --- 3. Handle VIP Usage ---
  try {
    await VIPService.incrementUsage(userId,'numerology');
  } catch (usageError) {
    console.warn('VIP usage error:', usageError);
  }

  // --- 4. Response ---
  // res.status(200).json({ analysis });

  // DEBUG RESPONSE
  const payload = {
    userId,
    domain: 'numerology',
    feature_type: 'overview',
    processedData: {
      user: userContext
    }
  };

  res.status(200).json({ 
    message: 'Numerology payload received and processed successfully', 
    payload 
  });
}

export async function getNumerology(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context } = req.body ?? {};

    // --- A. Validate Meta Data ---
    if (domain !== 'numerology') {
      res.status(400).json({ message: 'Invalid domain (expected "numerology")' });
      return;
    }

    if (feature_type !== 'overview') {
      res.status(400).json({ message: 'Invalid feature_type. Only "overview" is supported.' });
      return;
    }

    // --- B. Validate User Context ---
    const validationError = validateNumerologyFields(user_context);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    // --- C. Process Logic ---
    await handleNumerologyLogic(userId, res, {
      userContext: user_context
    });

  } catch (error) {
    console.error('Error in getNumerology:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}