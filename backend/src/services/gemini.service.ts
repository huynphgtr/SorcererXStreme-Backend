import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

// Log API key status (without exposing the key)
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables!');
  console.error('Please add GEMINI_API_KEY to your .env file');
  console.error('Current working directory:', process.cwd());
  console.error('.env file should be in:', path.resolve(__dirname, '../../.env'));
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper function to retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Only retry on 503 (Service Unavailable) or 429 (Too Many Requests)
      if (error.status === 503 || error.status === 429) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms due to ${error.status}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry on other errors
      throw error;
    }
  }
  
  throw lastError;
}

export async function getAiResponse(prompt: string): Promise<string> {
  try {
    if (!genAI || !apiKey) {
      console.error('GEMINI_API_KEY check failed');
      console.error('genAI:', !!genAI);
      console.error('apiKey:', !!apiKey);
      throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.');
    }

    console.log('[Gemini] Using model: gemini-2.5-flash');
    
    // Use gemini-2.5-flash - available in paid tier
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      systemInstruction: "Bạn là một chuyên gia Tarot hàng đầu với kinh nghiệm 20 năm. Bạn có khả năng đọc và giải thích ý nghĩa sâu sắc của các lá bài Tarot. Hãy luôn đưa ra lời giải chi tiết, tâm linh và đầy cảm hứng."
    });
    
    // Retry logic for 503 errors
    let lastError: any;
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini] Sending request to API (attempt ${attempt}/${maxRetries})...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('[Gemini] Received response, length:', text.length);
        return text;
      } catch (error: any) {
        lastError = error;
        
        // Only retry on 503 Service Unavailable
        if (error.status === 503 && attempt < maxRetries) {
          console.log(`[Gemini] Server overloaded (503), retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // Don't retry on other errors
        throw error;
      }
    }
    
    throw lastError;
  } catch (error: any) {
    console.error('[Gemini] Error getting AI response:', error);
    console.error('[Gemini] Error status:', error.status);
    console.error('[Gemini] Error message:', error.message);
    
    // Provide more helpful error messages
    if (error.message?.includes('API_KEY') || error.status === 400) {
      throw new Error('GEMINI_API_KEY is invalid. Please check your API key in .env file.');
    }
    if (error.status === 429) {
      throw new Error('API quota exceeded. Please wait a moment or upgrade your plan.');
    }
    if (error.status === 503) {
      throw new Error('Gemini servers are currently overloaded. Please try again in a moment.');
    }
    
    throw new Error(`AI service error: ${error.message || 'Unknown error'}`);
  }
}
