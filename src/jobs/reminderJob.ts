// src/jobs/reminderJob.ts
import cron from 'node-cron';
import { ReminderService, NotificationService } from '../services/reminder.service';

// Job này sẽ chạy mỗi giờ một lần (vào phút thứ 0 của mỗi giờ)
export function startReminderJob() {
  console.log('Scheduled reminder job.');
  
  cron.schedule('0 * * * *', async () => {
    console.log('Running reminder job...');
    try {
      const reminders = await ReminderService.findUsersToRemind();
      
      if (reminders.length === 0) {
        console.log('No users to remind at this time.');
        return;
      }
      
      console.log(`Found ${reminders.length} users to remind.`);
      
      // Mảng để lưu user ID đã được gửi thông báo thành công
      const sentUserIds: string[] = [];

      for (const reminder of reminders) {
        // Tạo nội dung thông báo (bạn có thể tùy chỉnh logic này phức tạp hơn)
        const notificationContent = `Hi ${reminder.user.name || 'there'}, this is your ${reminder.frequency} reminder! Don't forget to check in.`;
        
        try {
            // Gửi thông báo
            await NotificationService.sendNotification(reminder.user, notificationContent);
            sentUserIds.push(reminder.user_id);
        } catch (sendError) {
            console.error(`Failed to send notification to user ${reminder.user_id}:`, sendError);
        }
      }

      // Cập nhật lại last_sent cho những user đã gửi thành công
      if (sentUserIds.length > 0) {
        await ReminderService.updateLastSent(sentUserIds);
        console.log(`Updated last_sent for ${sentUserIds.length} users.`);
      }

    } catch (error) {
      console.error('Error during reminder job:', error);
    }
  });
}