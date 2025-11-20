import { verify, sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export function verifyJWT(token: string): Promise<{ id: string; userId?: string }> {
  return new Promise((resolve, reject) => {
    verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
      if (err) {
        return reject(err);
      }
      // Support both formats: backendv1 uses 'id', backend uses 'userId'
      const result = {
        id: decoded.id || decoded.userId,
        userId: decoded.id || decoded.userId
      };
      resolve(result);
    });
  });
}

export function signJWT(payload: { userId: string }): string {
  const jti = uuidv4();
  return sign(
    { id: payload.userId, email: payload.userId },
    process.env.JWT_SECRET!,
    { expiresIn: '1h', jwtid: jti }
  );
}
