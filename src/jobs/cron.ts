import { DBService } from '../services/db.service';
import { MailService } from '../services/mail.service';

export const runDailyJob = async (event: any) => {
  console.log('--- Bắt đầu Cron Job ---');

  try {
    const users = await DBService.getUsersForNotification();
    console.log(`Tìm thấy ${users.length} người dùng.`);

    if (users.length === 0) return;

    // 2. Gửi mail cho từng người (chạy song song để nhanh hơn)
    const promises = users.map(user => {
      if (user.email) {
        return MailService.sendDailyUpdate(user.email, user.name || 'Bạn');
      }
    });

    // Đợi tất cả gửi xong
    await Promise.allSettled(promises);
    console.log('--- Hoàn thành Cron Job ---');    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Đã gửi thông báo thành công' })
    };

  } catch (error) {
    console.error('Lỗi Cron Job:', error);
    // Lưu ý: Với Cron Job, throw error sẽ khiến AWS retry (chạy lại)
    // Tùy logic mà bạn muốn throw hay chỉ log lỗi.
  }
};