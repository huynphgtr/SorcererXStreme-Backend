import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';
import { AIService } from '../services/ai.service';

interface AstrologyContext {
  name?: string;
  gender?: string;
  birth_date?: string;
  birth_place?: string;
  [key: string]: any;
}

function validateRequiredFields(ctx: any, label: string): string | null {
  if (!ctx) return `Missing ${label} object`;
  
  const required = ['name', 'birth_date', 'gender'];
  const missing = required.find(field => !ctx[field] || ctx[field].toString().trim() === '');

  if (missing) return `Field '${missing}' is required in ${label}`;
  return null;
}

async function handleAstrologyLogic(
  params: {
    mode: 'overview' | 'love';
    userContext: AstrologyContext;
    partnerContext?: AstrologyContext;
    userId: string;
  }
) {
  const { mode, userContext, partnerContext, userId } = params;
    const aiPayload = {
      domain: "astrology",
      feature_type: mode,
      user_context: userContext,
      partner_context: partnerContext ?? null
    };
    // const aiResponse = await AIService.callMysticEndpoint(aiPayload);
  
    // 3. Handle VIP Usage 
    try {
      if(mode === 'love') {
        await VIPService.incrementUsage(userId, 'astrology_love');
      } else {
        await VIPService.incrementUsage(userId, 'astrology_overview');
      }
    } catch (usageError) {
      console.warn('Failed to increment usage counter:', usageError);
    }

    // const answer = aiResponse?.answer || aiResponse;
    // console.log('[Astrology] Extracted answer length:', answer?.length || 0); 
    // return { analysis: answer };

}

export async function processAstrologyReading(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { domain, feature_type, user_context, partner_context } = req.body ?? {};

    // --- A. Validate Meta Data ---
    if (domain !== 'astrology') {
      res.status(400).json({ message: 'Invalid domain' });
      return;
    }

    if (feature_type !== 'overview' && feature_type !== 'love') {
      res.status(400).json({ message: "Invalid feature_type. Expected 'overview' or 'love'" });
      return;
    }

    // --- B. Validate User Context (Always Required) ---
    const userError = validateRequiredFields(user_context, 'user_context');
    if (userError) {
      res.status(400).json({ message: userError });
      return;
    }

    // --- C. Validate Partner Context (Conditional) ---
    if (feature_type === 'love') {
      const partnerError = validateRequiredFields(partner_context, 'partner_context');
      if (partnerError) {
        res.status(400).json({ message: partnerError });
        return;
      }
    } 

    // --- D. Process Logic ---
    const result = await handleAstrologyLogic({
      mode: feature_type, 
      userContext: user_context,
      partnerContext: partner_context ?? undefined,
      userId: userId
    });
    res.status(200).json(result);

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}