import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';
import { AIService } from '../services/ai.service';

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
  res: Response,
  params: {
    userContext: NumerologyContext;
    userId: string;
  }
) {
  const { userContext, userId } = params;

  const aiPayload = {
    domain: "numerology",
    feature_type: "overview",
    user_context: userContext
  };
  // const aiResponse = await AIService.callMysticEndpoint(aiPayload);

  try {
    await VIPService.incrementUsage(userId, 'numerology');
  } catch (usageError) {
    console.warn('Failed to increment usage counter:', usageError);
  }
  // console.log('Test inccrement usage for numerology');

  // const answer = aiResponse?.answer || aiResponse;
  // return { analysis: answer };

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
    const result = await handleNumerologyLogic(res, {
      userContext: user_context,
      userId: userId
    });
    res.status(200).json(result);

  } catch (error) {
    console.error('Error in getNumerology:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}