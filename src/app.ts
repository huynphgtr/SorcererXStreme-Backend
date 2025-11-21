import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import partnerRoutes from './routes/partner.routes';
// import chatRoutes from './routes/chat.routes';
// import tarotRoutes from './routes/tarot.routes';
// import astrologyRoutes from './routes/astrology.routes';
// import fortuneRoutes from './routes/fortune.routes';
// import numerologyRoutes from './routes/numerology.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import eventRoutes from './routes/event.routes';
import reminderRoutes from './routes/reminder.routes';


dotenv.config();

// const app: Application = express();
const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001' 
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);   
app.use('/api/events', eventRoutes);
app.use('/api/reminders', reminderRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/tarot', tarotRoutes);
// app.use('/api/astrology', astrologyRoutes);
// app.use('/api/fortune', fortuneRoutes);
// app.use('/api/numerology', numerologyRoutes);

app.use(errorMiddleware);

export default app;
