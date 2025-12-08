import { Request, Response } from 'express';
import { ReminderService } from '../services/reminder.service';
import { updateReminderSchema } from '../validators/reminder.validator';
import { z } from 'zod';

// interface AuthRequest extends Request {
//     user?: {
//         id: string;
//     };
// }

// --- Controller Logic ---

/**
 * @route GET /reminders/settings
 * @description Lấy cài đặt reminder hiện tại của người dùng. 
 * Nếu chưa có, sẽ tạo cài đặt mặc định.
 */
export async function getReminderSettings(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        return;
    }

    try {
        const settings = await ReminderService.getReminderSettings(userId);
        res.status(200).json(settings);
    } catch (error) {
        console.error('[Get Reminder Settings Error]:', error);
        res.status(500).json({ message: 'Internal server error while fetching settings.' });
    }
}

/**
 * @route POST/PUT /reminders/settings
 * @description Cập nhật cài đặt reminder (Đăng ký/Hủy đăng ký)
 */
export async function updateReminderSettings(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized: User ID not found.' });
        return;
    }

    try {
        // 1. Xác thực Dữ liệu đầu vào
        const data = updateReminderSchema.parse(req.body);
        
        // 2. Kiểm tra Logic: Không cho phép user cập nhật lại frequency (vì đã cố định là 'daily')
        if ('frequency' in data) {
             res.status(400).json({ message: 'Frequency cannot be changed via this endpoint.' });
             return;
        }
        
        // 3. Gọi Service để cập nhật (đặt is_subscribed = true/false)
        const updatedSettings = await ReminderService.updateReminderSettings(userId, data);
        
        const action = updatedSettings.is_subscribed ? 'đăng ký thành công' : 'hủy đăng ký thành công';

        res.status(200).json({ 
            message: `Bạn đã ${action} nhận thông báo hằng ngày.`,
            settings: updatedSettings 
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
            return;
        }
        console.error('[Update Reminder Settings Error]:', error);
        res.status(500).json({ message: 'Internal server error while updating settings.' });
    }
}