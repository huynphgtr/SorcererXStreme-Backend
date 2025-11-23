import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Khởi tạo SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function getAiResponse(prompt: string): Promise<string> {
  try {
    // Cấu hình model
    const model = genAI.getGenerativeModel({ 
      // LƯU Ý: Dùng 'gemini-1.5-flash' để phản hồi nhanh nhất và ổn định.
      // Nếu bạn có quyền truy cập gemini-2.0, hãy đổi thành 'gemini-2.0-flash-exp'.
      model: 'gemini-2.5-flash', 
      
      generationConfig: {
        temperature: 0.8, // Độ sáng tạo cao cho văn phong Tarot/Chiêm tinh
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 3000, // Tăng lên chút để đủ viết dài
      },
      
      // QUAN TRỌNG: Tắt bộ lọc an toàn (Safety Filters)
      // Tarot/Chiêm tinh hay nói về tình yêu, đam mê dễ bị AI hiểu nhầm là nội dung nhạy cảm
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE, // Cực kỳ quan trọng cho Love Astrology
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE, // Quan trọng cho dự đoán tương lai
        },
      ],
    });
    
    // Gọi API tạo nội dung
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Lấy text trả về
    const text = response.text();
    
    // Kiểm tra an toàn lần cuối
    if (!text) {
        console.warn('Gemini response is empty.');
        if (response.promptFeedback) {
             console.warn('Block Reason:', response.promptFeedback);
        }
        return "Vũ trụ đang im lặng (AI không phản hồi). Vui lòng thử lại.";
    }

    return text;
  } catch (error: any) {
    console.error('Error getting AI response:', error);
    
    // Log chi tiết nếu bị chặn bởi Google
    if (error.response?.promptFeedback) {
        console.error('Security Block:', error.response.promptFeedback);
        return "Nội dung bị chặn bởi bộ lọc an toàn của Google. Hãy thử điều chỉnh câu hỏi.";
    }

    // Không throw Error để server không bị crash, trả về thông báo lỗi cho user
    return "Hệ thống đang quá tải hoặc gặp lỗi kết nối. Vui lòng thử lại sau giây lát.";
  }
}