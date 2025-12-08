// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// declare global {
//   namespace Express {
//     interface Request {
//       user?: any; 
//     }
//   }
// }

// export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; 
//   if (token == null) {
//     return res.sendStatus(401); 
//   }

//   try {
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

//     const isBlocked = await prisma.tokenBlocklist.findUnique({
//       where: { jti: decoded.jti },
//     });

//     if (isBlocked) {
//       return res.status(401).json({ message: 'Token is invalidated' });
//     }

//     req.user = decoded; // Gắn thông tin user vào request
//     next(); // Chuyển sang middleware/controller tiếp theo
//   } catch (err) {
//     return res.status(403).json({ message: 'Token is not valid' }); // Forbidden
//   }
// }

// export interface AuthRequest extends Request {
//   userId?: string;
// }

import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// 1. Cấu hình Verifier (Bộ kiểm tra token)
// Nó sẽ tự động tải Key từ AWS về và cache lại, rất nhanh.
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,       
  tokenUse: "access",                          
  clientId: process.env.USER_POOL_CLIENT_ID!,  
});

// Mở rộng kiểu Request để TS không báo lỗi req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // 2. Lấy token từ Header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // 3. Verify Token bằng thư viện AWS
    // Nếu token hết hạn, sai chữ ký, hoặc sai Client ID -> Nó sẽ tự throw error
    const payload = await verifier.verify(token);

    // 4. Gắn thông tin User vào Request
    // payload.sub chính là UUID của user (trùng với ID trong NeonDB)
    req.user = {
      id: payload.sub,
      email: payload.username, // Cognito thường để username là email (nếu config vậy)
    };

    next();
  } catch (err) {
    console.error('Auth Error:', err);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}

