import nodemailer from 'nodemailer';

// Cấu hình transporter (dùng biến môi trường cho production)
// Ví dụ này dùng Mailtrap/Ethereal cho development
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // ví dụ: "smtp.mailtrap.io"
  port: Number(process.env.EMAIL_PORT), // ví dụ: 2525
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class EmailService {
  static async sendPasswordResetEmail(to: string, token: string) {
    // Link này nên trỏ đến trang reset password trên frontend của bạn
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: '"sorcererxstreme" <tranphuonghuyen2005@gmail.com>',
      to: to,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="${resetLink}">link</a> to reset your password.</p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  }
}