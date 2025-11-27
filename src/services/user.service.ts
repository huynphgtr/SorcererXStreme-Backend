import { PrismaClient, Gender } from '@prisma/client';


const prisma = new PrismaClient();

type UserProfileData = {
  name?: string;
  gender?: Gender;
  birth_date?: string;
  birth_time?: string;
  birth_place?: string;
};

export class UserService {
  static async updateUserProfile(userId: string, data: UserProfileData) {
    const updateData: any = { ...data };
    if (data.birth_date) {
      updateData.birth_date = new Date(data.birth_date);
    }
    
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      // Chọn các trường muốn trả về sau khi cập nhật
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        is_vip: true,
        birth_date: true,
        birth_time: true,
        birth_place: true,
      },
    });

    return updatedUser;
  }

  static async findUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        is_vip: true,
        birth_date: true,
        birth_time: true,
        birth_place: true,
        created_at: true,
      },
    });

    return user;
  }

  static async upgradeToVIP(userId: string, tier: string = 'VIP', durationDays: number = 30) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        is_vip: true,
        vip_tier: tier,
        vip_expires_at: expiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        is_vip: true,
        birth_date: true,
        birth_time: true,
        birth_place: true,
        created_at: true,
        vip_tier: true,
        vip_expires_at: true,
      },
    });

    return updatedUser;
  }
}

