// src/services/db.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DBService {
  
static async getUsersForNotification() {
    try {
      // 1. Tìm trong bảng Reminder và join sang bảng User
      const results = await prisma.reminder.findMany({
        where: {
          is_subscribed: true, // Chỉ lấy người đã đăng ký
          user: {
            email: {
              not: undefined // Đảm bảo User liên kết có email (tránh lỗi null)
            }
          }
        },
        select: {
          user: {
            select: {
              email: true,
              name: true
            }
          }
        }
      });
      
      // 2. Làm phẳng dữ liệu (Flatten)
      // Prisma trả về dạng: [ { user: { email: '...', name: '...' } }, ... ]
      // Ta cần chuyển về: [ { email: '...', name: '...' }, ... ]
      const flattenedUsers = results.map(item => ({
        email: item.user.email,
        name: item.user.name
      }));

      return flattenedUsers;

    } catch (error) {
      console.error('Prisma Error:', error);
      throw error;
    }
  }  
}