import { PrismaClient, User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './email.service'; 

const prisma = new PrismaClient();

// export class AuthService {
//   static async createUser(data: { email: string; password_hash: string }) {
//     const user = await prisma.user.create({
//       data: {
//         email: data.email,
//         password_hash: data.password_hash,
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         is_vip: true,
//         created_at: true,
//       },
//     });
//     return user;
//   }

//   static async findUserByEmail(email: string) {
//     return await prisma.user.findUnique({ where: { email } });
//   }

//   static async hashPassword(password: string) {
//     return await hash(password, 10);
//   }

//   static async comparePasswords(password: string, hash: string): Promise<boolean> {
//     return await compare(password, hash);
//   }

//   static generateJwtToken(user: User): string {
//     const payload = {
//       id: user.id,
//       email: user.email,
//     };
//     const jti = uuidv4(); // Tạo một ID duy nhất cho token

//     if (!process.env.JWT_SECRET) {
//       throw new Error('JWT_SECRET is not defined');
//     }

//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//       jwtid: jti, // Thêm jti vào token
//     });

//     return token;
//   }

//   static async blockToken(jti: string, exp: number) {
//     // exp là timestamp (giây), cần chuyển sang Date object (mili giây)
//     const expiresAt = new Date(exp * 1000);
//     await prisma.tokenBlocklist.create({
//       data: {
//         jti,
//         expiresAt,
//       },
//     });
//   }

//   static async handleForgotPassword(email: string) {
//     const user = await prisma.user.findUnique({ where: { email } });
    
//     // An toàn: Không báo lỗi nếu không tìm thấy user để tránh user enumeration
//     if (!user) {
//       return; 
//     }

//     // Tạo token ngẫu nhiên, an toàn
//     const token = crypto.randomBytes(32).toString('hex');
//     const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

//     // Lưu token vào database
//     await prisma.passwordResetToken.create({
//       data: {
//         user_id: user.id,
//         token: token,
//         expiresAt: expiresAt,
//       },
//     });

//     // Gửi email chứa token
//     console.log(token)
//     await EmailService.sendPasswordResetEmail(user.email, token);
//   }

//   static async handleResetPassword(token: string, newPassword: string) {
//     // 1. Tìm token trong database
//     const resetToken = await prisma.passwordResetToken.findUnique({
//       where: { token: token },
//     });

//     // 2. Kiểm tra token có hợp lệ và còn hạn không
//     if (!resetToken || resetToken.expiresAt < new Date()) {
//       throw new Error('Invalid or expired password reset token.');
//     }

//     // 3. Hash mật khẩu mới
//     const passwordHash = await this.hashPassword(newPassword);

//     // 4. Cập nhật mật khẩu cho user
//     await prisma.user.update({
//       where: { id: resetToken.user_id },
//       data: { password_hash: passwordHash },
//     });
    
//     // 5. Xóa token đã sử dụng để nó không thể được dùng lại
//     await prisma.passwordResetToken.delete({
//       where: { id: resetToken.id },
//     });
//   }


// }