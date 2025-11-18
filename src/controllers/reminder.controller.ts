import { Request, Response } from 'express';
import { ReminderService } from '../services/reminder.service';
import { updateReminderSchema } from '../validators/reminder.validator';
import { z } from 'zod';

// GET: Lấy cài đặt reminder
export async function getReminderSettings(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const settings = await ReminderService.getReminderSettings(userId);
    res.status(200).json(settings);
  } catch (error) {
    console.error('[Get Reminder Settings Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// UPDATE: Cập nhật cài đặt reminder
export async function updateReminderSettings(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const data = updateReminderSchema.parse(req.body);

    const updatedSettings = await ReminderService.updateReminderSettings(userId, data);
    res.status(200).json(updatedSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten().fieldErrors });
    }
    console.error('[Update Reminder Settings Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}