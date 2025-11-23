import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../services/jwt.service';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (token == null) {
    return res.sendStatus(401); 
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const isBlocked = await prisma.tokenBlocklist.findUnique({
      where: { jti: decoded.jti },
    });

    if (isBlocked) {
      return res.status(401).json({ message: 'Token is invalidated' });
    }

    req.user = decoded; // Gắn thông tin user vào request
    next(); // Chuyển sang middleware/controller tiếp theo
  } catch (err) {
    return res.status(403).json({ message: 'Token is not valid' }); // Forbidden
  }
}

export interface AuthRequest extends Request {
  userId?: string;
}

// export async function authMiddleware(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader?.startsWith('Bearer ') 
//       ? authHeader.substring(7) 
//       : req.cookies?.token;

//     if (!token) {
//       res.status(401).json({ message: 'Unauthorized - No token provided' });
//       return;
//     }

//     const decoded = await verifyJWT(token);
//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     res.status(401).json({ message: 'Unauthorized - Invalid token' });
//   }
// }


