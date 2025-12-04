import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../validators/auth.validator'; 
import { AuthService } from '../services/auth.service'; 
import jwt from 'jsonwebtoken';
import { forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';


const prisma = new PrismaClient();

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existingUser = await AuthService.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    const passwordHash = await AuthService.hashPassword(password);

    const newUser = await AuthService.createUser({
      email,
      password_hash: passwordHash,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser, 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.flatten().fieldErrors, 
      });
      return;
    }

    console.error('[Register Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await AuthService.findUserByEmail(email);

    if (!user || !(await AuthService.comparePasswords(password, user.password_hash!))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = AuthService.generateJwtToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,              
        birth_date: user.birth_date,      
        birth_time: user.birth_time,      
        birth_place: user.birth_place,    
        is_vip: user.is_vip,              
        vip_tier: user.vip_tier,          
        vip_expires_at: user.vip_expires_at, 
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      });
      return;
    }
    
    console.error('[Login Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(400).json({ message: 'No token provided' });
      return;
    }

    const decoded: any = jwt.decode(token);

    if (decoded && decoded.jti) {
      await AuthService.blockToken(decoded.jti, decoded.exp);
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Logout Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await AuthService.handleForgotPassword(email);

    // Luôn trả về thông báo thành công để bảo mật
    res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      });
      return;
    }
    console.error('[Forgot Password Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await AuthService.handleResetPassword(token, password);
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    if (error.message.includes('Invalid or expired')) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      });
      return;
    }
    console.error('[Reset Password Error]:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


