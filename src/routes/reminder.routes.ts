import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { getReminderSettings, updateReminderSettings } from '../controllers/reminder.controller';

const reminderRouter = Router();

reminderRouter.use(authenticateToken);
reminderRouter.get('/', getReminderSettings);
reminderRouter.patch('/', updateReminderSettings);

export default reminderRouter;