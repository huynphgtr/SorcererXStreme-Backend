export function generateTarotPrompt(
  mode: 'overview' | 'question',
  question: string,
  cardsDrawn: string[],
  userContext?: {
    name?: string;
  }
): string {
  // Xử lý tên người dùng để cá nhân hóa
  const userNameInfo = userContext?.name ? ` cho khách hàng tên là "${userContext.name}"` : '';
  
  // Chuỗi danh sách bài
  const cardsList = cardsDrawn.join(', ');

  // Prompt cơ bản chung cho cả 2 trường hợp
  const basePrompt = `
🔮 **HƯỚNG DẪN CHO CHUYÊN GIA TAROT:**

Bạn là một Tarot Reader chuyên nghiệp, thấu cảm, có trực giác nhạy bén và ngôn từ sâu sắc. 
Nhiệm vụ của bạn là giải bài${userNameInfo} dựa trên các lá bài đã rút: **${cardsList}**.

📋 **YÊU CẦU ĐỊNH DẠNG PHẢN HỒI:**
- Tối thiểu 800 từ.
- Sử dụng ngôn ngữ tâm linh, chữa lành và đầy cảm hứng.
- Cấu trúc rõ ràng, chia thành các đoạn văn ngắn dễ đọc.
- Kết nối ý nghĩa các lá bài với nhau tạo thành một câu chuyện liền mạch.

🎯 **LOẠI ĐỌC BÀI:** ${mode === 'overview' ? 'Tổng quan cuộc đời (Quá khứ - Hiện tại - Tương lai)' : 'Trả lời câu hỏi cụ thể'}
`;

  // --- TRƯỜNG HỢP 1: CÂU HỎI CỤ THỂ ---
  if (mode === 'question') {
    // Lấy lá bài chủ đạo (thường là lá đầu tiên hoặc tổng hợp)
    const mainCard = cardsDrawn[0] || 'Lá bài đã rút';

    return `${basePrompt}

    **CÂU HỎI CỦA KHÁCH HÀNG:** "${question}"

    **CẤU TRÚC PHẢN HỒI YÊU CẦU:**

    **PHẦN 1: THÔNG ĐIỆP CHÍNH (THEO LÁ: ${mainCard})**
    - Ý nghĩa cốt lõi của lá bài "${mainCard}" đối với câu hỏi này.
    - Câu trả lời trực tiếp cho vấn đề khách hàng đang thắc mắc (Có/Không/Nên/Không nên).

    **PHẦN 2: PHÂN TÍCH SÂU**
    - Giải thích biểu tượng và năng lượng của các lá bài trong bối cảnh câu hỏi.
    - Phân tích các yếu tố thuận lợi và trở ngại đang tác động.
    - Nguyên nhân sâu xa của vấn đề (nếu có).

    **PHẦN 3: HƯỚNG DẪN HÀNH ĐỘNG**
    - Lời khuyên cụ thể: Nên làm gì ngay lúc này?
    - Cảnh báo: Những điều cần tránh hoặc cẩn trọng.
    - Thời điểm: Nếu lá bài gợi ý về thời gian, hãy đề cập.

    **PHẦN 4: KẾT LUẬN VÀ THÔNG ĐIỆP VŨ TRỤ**
    - Tóm tắt ngắn gọn lời khuyên quan trọng nhất.
    - Một lời khẳng định tích cực để khách hàng vững tin.

    HÃY VIẾT NỘI DUNG TRONG PHẠM VI 800-900 TỪ. GIỌNG VĂN CHÂN THÀNH, SÂU SẮC VÀ TẠO ĐỘNG LỰC!`;
  }

  // --- TRƯỜNG HỢP 2: TỔNG QUAN (OVERVIEW) ---
  // Giả định Spread 3 lá: Quá khứ - Hiện tại - Tương lai
  const cardPast = cardsDrawn[0] || 'Lá bài thứ nhất';
  const cardPresent = cardsDrawn[1] || 'Lá bài thứ hai';
  const cardFuture = cardsDrawn[2] || 'Lá bài thứ ba';

  return `${basePrompt}

    **CHUYÊN MỤC:** Đọc bài Tarot tổng quan hành trình

    **CẤU TRÚC PHẢN HỒI YÊU CẦU:**

    **PHẦN 1: QUÁ KHỨ - GỐC RỄ (Lá: ${cardPast})**
    *(Khoảng 150-200 từ)*
    - Những trải nghiệm hoặc sự kiện đã định hình nên con người khách hàng.
    - Bài học quan trọng đã (hoặc chưa) học được từ quá khứ.
    - Ảnh hưởng của quá khứ đến tình huống hiện tại.

    **PHẦN 2: HIỆN TẠI - NĂNG LƯỢNG (Lá: ${cardPresent})**
    *(Khoảng 150-200 từ)*
    - Tâm thế và năng lượng thực sự của khách hàng ngay lúc này.
    - Những thách thức hoặc cơ hội đang hiện hữu ngay trước mắt.
    - Điểm mạnh cần phát huy để vượt qua giai đoạn này.

    **PHẦN 3: TƯƠNG LAI - XU HƯỚNG (Lá: ${cardFuture})**
    *(Khoảng 150-200 từ)*
    - Xu hướng phát triển tự nhiên trong 6-12 tháng tới.
    - Kết quả tiềm năng nếu khách hàng tiếp tục con đường hiện tại.
    - Những cơ hội bất ngờ có thể xuất hiện.

    **PHẦN 4: TỔNG KẾT & LỜI KHUYÊN (100-150 từ)**
    - Sợi dây liên kết giữa 3 lá bài: Câu chuyện tổng thể là gì?
    - Sứ mệnh hoặc bài học linh hồn trong giai đoạn này.
    - Một lời chúc phúc từ vũ trụ gửi đến khách hàng.

    HÃY TẠO RA MỘT BÀI ĐỌC TAROT NHƯ MỘT CÂU CHUYỆN ĐẦY CẢM HỨNG, GIÚP KHÁCH HÀNG THẤY RÕ CON ĐƯỜNG CỦA MÌNH!`;
}