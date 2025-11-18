import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type UserProfileData = {
  name?: string;
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
        is_vip: true,
        birth_date: true,
        birth_time: true,
        birth_place: true,
        created_at: true,
      },
    });

    return user;
  }
}

