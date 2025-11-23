import { Response } from 'express';
import { getAiResponse } from '../services/gemini.service';
import { generateAstrologyPrompt } from '../services/ai-prompts.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { VIPService } from '../services/vip.service';

// --- Helper Function (Private) ---
async function handleAstrologyLogic(
  userId: string,
  res: Response,
  params: {
    mode: 'overview' | 'natal_chart' | 'love'
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    userContext?: any;
    // Có thể thêm partnerContext nếu tính Love compatibility
    partnerContext?: any;
  }
) {
  const { mode, birthDate, birthTime, birthPlace, userContext, partnerContext } = params;

  // 1. Chuẩn bị context đầy đủ
  const fullUserContext = {
    ...userContext,
    birthDate,
    birthTime,
    birthPlace,
    partnerContext
  };

  // 2. Generate Prompt
  let prompt = generateAstrologyPrompt(mode, fullUserContext);

  // 3. Call AI
  let analysis = await getAiResponse(prompt);
  // console.log('--- DEBUG ANALYSIS ---');
  // console.log(typeof analysis);
  // console.log(analysis ? analysis.substring(0, 50) + '...' : 'Analysis is NULL/UNDEFINED');
  // 4. Handle VIP Usage
  try {
    await VIPService.incrementUsage(userId, 'astrology');
  } catch (usageError: any) {
    console.warn('Failed to increment usage counter:', usageError.message);
    // Continue execution
  }

  console.log(`[Astrology - ${mode}] Sending response to client`);

  // 5. Response
  res.status(200).json({ analysis });
}

// --- Main Controllers ---

/**
 * Xem Tử vi/Chiêm tinh tổng quan (Overview)
 * Thường là dự báo ngày, tuần, hoặc tính cách sơ lược.
 * Yêu cầu: Ngày sinh là bắt buộc.
 */
export async function getAstrologyOverview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { birthDate, birthTime, birthPlace, userContext } = req.body;

    if (!birthDate) {
      res.status(400).json({ message: 'Birth date is required' });
      return;
    }

    await handleAstrologyLogic(userId, res, {
      mode: 'overview',
      birthDate,
      birthTime,
      birthPlace,
      userContext
    });

  } catch (error: any) {
    handleError(res, error);
  }
}

/**
 * Xem Bản đồ sao (Natal Chart)
 * Phân tích sâu về tính cách, tiềm năng dựa trên vị trí các hành tinh.
 * Yêu cầu: Cần chính xác Ngày, Giờ và Nơi sinh để vẽ chart chuẩn.
 */
export async function getAstrologyNatalChart(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { birthDate, birthTime, birthPlace, userContext } = req.body;

    if (!birthDate || !birthTime || !birthPlace) {
      res.status(400).json({
        message: 'Birth date, time, and place are required for accurate Natal Chart reading'
      });
      return;
    }

    await handleAstrologyLogic(userId, res, {
      mode: 'natal_chart',
      birthDate,
      birthTime,
      birthPlace,
      userContext
    });

  } catch (error: any) {
    handleError(res, error);
  }
}

/**
 * Xem Tình yêu (Love)
 * Dự đoán tình duyên hoặc độ hợp nhau.
 */
export async function getAstrologyLove(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { birthDate, birthTime, birthPlace, userContext, partnerContext } = req.body;

    if (!birthDate) {
      res.status(400).json({ message: 'Birth date is required' });
      return;
    }

    await handleAstrologyLogic(userId, res, {
      mode: 'love',
      birthDate,
      birthTime,
      birthPlace,
      userContext,
      partnerContext
    });

  } catch (error: any) {
    handleError(res, error);
  }
}

// --- Error Handling Helper ---
function handleError(res: Response, error: any) {
  console.error('[Astrology] Controller error:', error);
  // console.error('[Astrology] Error stack:', error.stack); // Uncomment if needed
  const errorMessage = error.message || 'Internal server error';
  res.status(500).json({
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}