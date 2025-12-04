// src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import partnerRoutes from './routes/partner.routes';
import chatRoutes from './routes/chat.routes';
import tarotRoutes from './routes/tarot.routes';
import astrologyRoutes from './routes/astrology.routes';
import numerologyRoutes from './routes/numerology.routes';
import horoscopeRoutes from './routes/horoscope.routes';
import reminderRoutes from './routes/reminder.routes';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();
const app: Application = express();

// --- CẤU HÌNH CORS ---
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- HEALTH CHECK ---
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend is running on Lambda!',
    region: process.env.AWS_REGION || 'local' 
  });
});

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);   
app.use('/api/reminders', reminderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tarot', tarotRoutes);
app.use('/api/astrology', astrologyRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/numerology', numerologyRoutes);

// --- ERROR HANDLING ---
app.use(errorMiddleware);
// --- EXPORT APP ---
export default app;