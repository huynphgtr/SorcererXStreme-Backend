import { PrismaClient, User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class AuthService {
  static async createUser(data: { email: string; password_hash: string }) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash: data.password_hash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        is_vip: true,
        created_at: true,
      },
    });
    return user;
  }

  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }

  static async hashPassword(password: string) {
    return await hash(password, 10);
  }

  static async comparePasswords(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  }

  // static generateJwtToken(user: User): string {
  //   const payload = {
  //     id: user.id,
  //     email: user.email,
  //   };

  //   if (!process.env.JWT_SECRET) {
  //     throw new Error('JWT_SECRET is not defined in environment variables');
  //   }

  //   const token = jwt.sign(payload, process.env.JWT_SECRET, {
  //     expiresIn: '1h',
  //   });

  //   return token;
  // }

  static generateJwtToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
    };
    const jti = uuidv4(); // Tạo một ID duy nhất cho token

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
      jwtid: jti, // Thêm jti vào token
    });

    return token;
  }

  static async blockToken(jti: string, exp: number) {
    // exp là timestamp (giây), cần chuyển sang Date object (mili giây)
    const expiresAt = new Date(exp * 1000);
    await prisma.tokenBlocklist.create({
      data: {
        jti,
        expiresAt,
      },
    });
  }
}