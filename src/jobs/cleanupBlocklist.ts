import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hàm này sẽ lên lịch và chạy công việc dọn dẹp
export function startBlocklistCleanupJob() {
  console.log('Scheduled blocklist cleanup job.');
  
  // Lên lịch để chạy vào lúc nửa đêm mỗi ngày ('0 0 * * *')
  cron.schedule('0 0 * * *', async () => {
    console.log('Running blocklist cleanup job...');
    try {
      const now = new Date();
      
      // Tìm và xóa tất cả các token trong blocklist đã hết hạn
      // (có cột expiresAt nhỏ hơn hoặc bằng thời điểm hiện tại)
      const result = await prisma.tokenBlocklist.deleteMany({
        where: {
          expiresAt: {
            lte: now, // lte = less than or equal to
          },
        },
      });

      console.log(`Cleanup finished. Deleted ${result.count} expired tokens from blocklist.`);
    } catch (error) {
      console.error('Error during blocklist cleanup job:', error);
    }
  });
}