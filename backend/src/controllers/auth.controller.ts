import { Response } from 'express';
import { hash, compare } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { signJWT } from '../services/jwt.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Missing email or password' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }

    const passwordHash = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
      },
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Missing email or password' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = signJWT({ userId: user.id });

    // Return user data with VIP info
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      birthDate: user.birth_date,
      birthTime: user.birth_time,
      birthPlace: user.birth_place,
      vipTier: user.vip_tier,
      vipExpiresAt: user.vip_expires_at
    };

    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
