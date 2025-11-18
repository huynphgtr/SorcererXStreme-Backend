import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getAiResponse } from '../services/gemini.service';
import { generateChatPrompt } from '../services/ai-prompts.service';
import { addBreakupContextToPrompt, getComfortingMessage } from '../services/breakup-utils.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
//   try {
//     const userId = req.userId;
//     if (!userId) {
//       res.status(401).json({ message: 'Unauthorized' });
//       return;
//     }

//     const { message, userContext } = req.body;

//     await prisma.chatMessage.create({
//       data: {
//         userId,
//         content: message,
//         role: 'user',
//       },
//     });

//     const recentMessages = await prisma.chatMessage.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'desc' },
//       take: 10,
//       select: { role: true, content: true }
//     });

//     const chatHistory = recentMessages.reverse();
//     let prompt = generateChatPrompt(message, userContext || {}, chatHistory);
    
//     if (userContext?.isInBreakup) {
//       prompt = addBreakupContextToPrompt(prompt, userContext);
//     }
    
//     let aiResponse = await getAiResponse(prompt);
    
//     if (userContext?.isInBreakup) {
//       const comfortingMsg = getComfortingMessage('chat');
//       aiResponse += `\n\n${comfortingMsg}`;
//     }

//     await prisma.chatMessage.create({
//       data: {
//         userId,
//         content: aiResponse,
//         role: 'assistant',
//       },
//     });

//     res.status(200).json({ response: aiResponse });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }

// export async function getChatHistory(req: AuthRequest, res: Response): Promise<void> {
//   try {
//     const userId = req.userId;
//     if (!userId) {
//       res.status(401).json({ message: 'Unauthorized' });
//       return;
//     }

//     const messages = await prisma.chatMessage.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'asc' },
//       take: 50
//     });

//     res.status(200).json({ messages });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// }
