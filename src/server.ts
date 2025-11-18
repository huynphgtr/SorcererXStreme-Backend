import app from './app';
import { startBlocklistCleanupJob } from './jobs/cleanupBlocklist';
import { startReminderJob } from './jobs/reminderJob';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  startBlocklistCleanupJob();
  startReminderJob();
});



