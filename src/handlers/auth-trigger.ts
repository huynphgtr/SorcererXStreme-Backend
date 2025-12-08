import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const postConfirmation = async (event: any) => {
  console.log('Event received:', JSON.stringify(event)); 

  try {
    const { sub, email, name } = event.request.userAttributes;

    if (!email) {
      console.log('Không có email trong userAttributes, bỏ qua.');
      return event;
    }

    // Upsert: Nếu chưa có thì tạo mới với ID = sub. 
    // Nếu có rồi thì chỉ update tên, KHÔNG ĐƯỢC update ID.
    await prisma.user.upsert({
      where: { email: email },
      update: {
        // KHÔNG update id ở đây để tránh lỗi Foreign Key
        name: name || email.split('@')[0],
        // Cập nhật lần đăng nhập cuối nếu muốn (tùy chọn)
        // last_login: new Date() 
      }, 
      create: {
        id: sub, // ID từ Cognito
        email: email,
        name: name || email.split('@')[0] || "Unknown User",
        // Các trường bắt buộc khác nếu có trong schema nhưng chưa có default
      }
    });

    console.log(`Đã đồng bộ user ${email} (Sub: ${sub}) vào DB`);
  } catch (error) {
    // Log lỗi chi tiết để xem trên CloudWatch
    console.error('Lỗi đồng bộ DB:', error);
    // KHÔNG throw error để user vẫn đăng nhập được dù DB lỗi
  }

  return event; 
};