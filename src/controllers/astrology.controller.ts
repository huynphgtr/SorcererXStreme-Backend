import { Response } from 'express';
import { getAiResponse } from '../services/gemini.service';
import { generateAstrologyPrompt } from '../services/ai-prompts.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';

interface AstrologyContext {
  name?: string;
  gender?: string;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
  [key: string]: any;
}

function validateRequiredFields(ctx: any, label: string): string | null {
  if (!ctx) return `Missing ${label} object`;
  
  const required = ['name', 'birth_date', 'birth_time', 'birth_place'];
  const missing = required.find(field => !ctx[field] || ctx[field].toString().trim() === '');

  if (missing) return `Field '${missing}' is required in ${label}`;
  return null;
}

async function handleAstrologyLogic(
  userId: string,
  res: Response,
  params: {
    mode: 'overview' | 'love';
    userContext: AstrologyContext;
    partnerContext?: AstrologyContext;
  }
) {
  const { mode, userContext, partnerContext } = params;
  // try {
  //   await VIPService.incrementUsage(userId, 'tarot');
  // } catch (usageError) {
  //   console.warn('Failed to increment usage counter:', usageError);
  // }
  res.status(200).json({
    message: 'Request processed successfully',
    payload: {
      userId,
      mode,
      processedData: {
        user: userContext,
        partner: partnerContext || null
      }
    }
  });
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
    } else if (partner_context) {
      const partnerError = validateRequiredFields(partner_context, 'partner_context');
      if (partnerError) {
        res.status(400).json({ message: partnerError });
        return;
      }
    }

    // --- D. Process Logic ---
    await handleAstrologyLogic(userId, res, {
      mode: feature_type, 
      userContext: user_context,
      partnerContext: partner_context ?? undefined
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}