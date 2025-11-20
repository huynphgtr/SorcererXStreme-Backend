import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        birth_date: true,
        birth_time: true,
        birth_place: true,
        vip_tier: true,
        vip_expires_at: true,
        created_at: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Map snake_case to camelCase for frontend
    const response = {
      id: user.id,
      email: user.email,
      name: user.name,
      birthDate: user.birth_date,
      birthTime: user.birth_time,
      birthPlace: user.birth_place,
      vipTier: user.vip_tier,
      vipExpiresAt: user.vip_expires_at,
      createdAt: user.created_at
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data = req.body;
    console.log('Updating profile with data:', data);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        birth_date: data.birthDate ? new Date(data.birthDate) : undefined,
        birth_time: data.birthTime,
        birth_place: data.birthPlace,
      },
      select: {
        id: true,
        email: true,
        name: true,
        birth_date: true,
        birth_time: true,
        birth_place: true,
        vip_tier: true,
        vip_expires_at: true,
        created_at: true
      }
    });

    console.log('Updated user:', user);

    // Map snake_case to camelCase for frontend
    const response = {
      id: user.id,
      email: user.email,
      name: user.name,
      birthDate: user.birth_date,
      birthTime: user.birth_time,
      birthPlace: user.birth_place,
      vipTier: user.vip_tier,
      vipExpiresAt: user.vip_expires_at,
      createdAt: user.created_at
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
