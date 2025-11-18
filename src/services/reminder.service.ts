import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ReminderUpdateData = {
  is_subscribed?: boolean;
  frequency?: 'daily' | 'weekly';
};

export class ReminderService {

    // GET: Lấy cài đặt reminder của user
    static async getReminderSettings(userId: string) {
        let reminder = await prisma.reminder.findUnique({
        where: { user_id: userId },
        });

        // Nếu user chưa có cài đặt reminder (user mới), hãy tạo một cái mặc định
        if (!reminder) {
        reminder = await prisma.reminder.create({
            data: {
            user_id: userId,
            // Các giá trị mặc định đã được định nghĩa trong schema
            },
        });
        }

        return reminder;
    }

    // UPDATE: Cập nhật cài đặt reminder
    static async updateReminderSettings(userId: string, data: ReminderUpdateData) {
        return prisma.reminder.update({
        where: { user_id: userId },
        data: data,
        });
    }

    static async findUsersToRemind() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Tìm những user thỏa mãn điều kiện
        const usersToRemind = await prisma.reminder.findMany({
        where: {
            is_subscribed: true, // Phải đang đăng ký nhận thông báo
            OR: [
            // Điều kiện cho daily: tần suất là daily VÀ lần gửi cuối là hơn 24h trước (hoặc chưa gửi bao giờ)
            {
                frequency: 'daily',
                last_sent: {
                lte: twentyFourHoursAgo, // lte: less than or equal to
                },
            },
            {
                frequency: 'daily',
                last_sent: null
            },
            // Điều kiện cho weekly: tần suất là weekly VÀ lần gửi cuối là hơn 7 ngày trước (hoặc chưa gửi bao giờ)
            {
                frequency: 'weekly',
                last_sent: {
                lte: sevenDaysAgo,
                },
            },
            {
                frequency: 'weekly',
                last_sent: null
            }
            ],
        },
        include: {
            user: { // Lấy cả thông tin user để biết gửi cho ai (ví dụ: email)
            select: { email: true, name: true }
            }
        }
        });

        return usersToRemind;
    }
  
  //Cập nhật last_sent sau khi gửi
    static async updateLastSent(userIds: string[]) {
        await prisma.reminder.updateMany({
            where: { user_id: { in: userIds } },
            data: { last_sent: new Date() }
        });
    }

}

//Mô phỏng việc gửi email/notification
export class NotificationService {
    static async sendNotification(user: { email: string, name: string | null }, content: string) {
            console.log(`--- Sending Notification ---`);
            console.log(`To: ${user.name} <${user.email}>`);
            console.log(`Content: ${content}`);
            console.log(`--------------------------`);
            return Promise.resolve();
    }
}

