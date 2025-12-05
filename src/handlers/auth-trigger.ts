import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const postConfirmation = async (event: any) => {
  try {
    const { sub, email, name } = event.request.userAttributes;
    await prisma.user.create({
      data: {
        id: sub, 
        email: email,
        name: name || email.split('@')[0],
      }
    });
    console.log(`Đã đồng bộ user ${email} vào DB`);
  } catch (error) {
    console.error('Lỗi đồng bộ:', error);
  }
  return event; 
};