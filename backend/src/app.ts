import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import chatRoutes from './routes/chat.routes';
import tarotRoutes from './routes/tarot.routes';
import astrologyRoutes from './routes/astrology.routes';
import fortuneRoutes from './routes/fortune.routes';
import numerologyRoutes from './routes/numerology.routes';
import subscriptionRoutes from './routes/subscription.routes';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

const app: Application = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001' // Allow Next.js dev server on both ports
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tarot', tarotRoutes);
app.use('/api/astrology', astrologyRoutes);
app.use('/api/fortune', fortuneRoutes);
app.use('/api/numerology', numerologyRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.use(errorMiddleware);

export default app;
