import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ReminderUpdateData = {
    is_subscribed?: boolean;
};

export class ReminderService {

    // GET: Lấy cài đặt reminder của user
    static async getReminderSettings(userId: string) {
        let reminder = await prisma.reminder.findUnique({
            where: { user_id: userId },
            select: { is_subscribed: true, last_sent: true } // Chỉ lấy các trường cần thiết
        });

        // Nếu user chưa có cài đặt reminder, hãy tạo một cái mặc định (frequency: daily)
        if (!reminder) {
            // Lưu ý: Đảm bảo default trong schema của bạn cho is_subscribed là FALSE 
            // để tuân thủ nguyên tắc Opt-in nghiêm ngặt (nếu cần). 
            reminder = await prisma.reminder.create({
                data: {
                    user_id: userId,
                    frequency: 'daily', // Giữ mặc định là daily
                },
            });
        }

        return reminder;
    }

    /**
     * UPDATE: Cập nhật cài đặt reminder (Đăng ký / Hủy đăng ký)
     */
    static async updateReminderSettings(userId: string, data: ReminderUpdateData) {
        return prisma.reminder.update({
            where: { user_id: userId },
            data: data,
        });
    }

    /**
     * CORE LOGIC: Tìm kiếm những user cần được gửi reminder DAILY.
     */
    static async findUsersToRemind() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Tìm những user thỏa mãn điều kiện:
        // 1. Phải đang đăng ký (is_subscribed: true)
        // 2. Phải có tần suất là daily
        // 3. Lần gửi cuối là hơn 24h trước (hoặc chưa gửi bao giờ)
        const usersToRemind = await prisma.reminder.findMany({
            where: {
                is_subscribed: true, // (1) Đảm bảo user đã đăng ký
                frequency: 'daily',  // (3) Chỉ xử lý daily
                OR: [
                    { last_sent: null }, // Chưa gửi lần nào
                    {
                        last_sent: {
                            // lte: less than or equal to
                            lte: twentyFourHoursAgo, 
                        },
                    },
                ],
            },
            include: {
                user: {
                    select: { id: true, email: true, name: true }
                }
            }
        });

        return usersToRemind;
    }
  
    // Cập nhật last_sent sau khi gửi
    static async updateLastSent(userIds: string[]) {
        await prisma.reminder.updateMany({
            where: { user_id: { in: userIds } },
            data: { last_sent: new Date() }
        });
    }

}

// Mô phỏng việc gửi email/notification (sẽ được sử dụng trong SendReminderLambda)
export class NotificationService {
    /**
     * Hàm này trong thực tế sẽ gọi AWS SES, Firebase Cloud Messaging (FCM) hoặc tương tự.
     * @param user Thông tin user nhận.
     * @param content Nội dung thông báo (Tử vi ngày, v.v.).
     */
    static async sendNotification(user: { id: string, email: string, name: string | null }, content: string) {
        // Trong môi trường Lambda, bạn sẽ gọi SES.sendEmail({ Source, Destination, Message })
        console.log(`--- Sending Notification ---`);
        console.log(`To: ${user.name || user.email}`);
        // Giả lập logic gửi thành công
        return Promise.resolve({ status: 'sent', userId: user.id });
    }
}