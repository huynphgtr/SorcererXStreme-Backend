import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../services/jwt.service';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    console.log('[Auth] Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('[Auth] Cookie token:', req.cookies?.token ? 'Present' : 'Missing');
    
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.token;

    if (!token) {
      console.log('[Auth] No token found');
      res.status(401).json({ message: 'Unauthorized - No token provided' });
      return;
    }

    const decoded = await verifyJWT(token);
    console.log('[Auth] Token verified, userId:', decoded.id || decoded.userId);
    req.userId = decoded.id || decoded.userId;
    next();
  } catch (error) {
    console.error('[Auth] Middleware error:', error);
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
}
