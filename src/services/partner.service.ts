import { PrismaClient, Gender } from '@prisma/client';

const prisma = new PrismaClient();

type AddPartnerData = { // Đổi tên cho rõ nghĩa
  partner_name: string;
  partner_gender?: Gender;
  partner_birth_date: string;
  partner_birth_time: string;
  partner_birth_place: string;
};

export class PartnerService {

// Kiểm tra xem user có đang trong một mối quan hệ không
static async hasActivePartner(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { partner_name: true },
  });
  // Nếu partner_name không phải null, nghĩa là đang có partner
  return user?.partner_name != null;
}

// --- Hiển thị thông tin partner ---
  static async getPartner(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        partner_name: true,
        partner_gender: true,
        partner_birth_date: true,
        partner_birth_time: true,
        partner_birth_place: true,
        relationship_start_date: true,
      },
    });

    // Nếu không tìm thấy user hoặc trường partner_name rỗng
    if (!user || !user.partner_name) {
      return null; // Hoặc bạn có thể throw new Error('No active partner found');
    }

    return user;
  }

//Thêm partner mới
static async addPartner(userId: string, data: AddPartnerData) {
    // BƯỚC 1: KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT
    const hasPartner = await this.hasActivePartner(userId);
    if (hasPartner) {
      // Ném ra lỗi cụ thể nếu user đã có partner
      throw new Error('An active partner already exists. Please remove the current partner before adding a new one.');
    }

    // BƯỚC 2: Nếu không có partner, tiến hành thêm mới
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        partner_birth_date: new Date(data.partner_birth_date),
        relationship_start_date: new Date(),
      },
      select: { 
        partner_name: true,
        partner_gender: true,
        partner_birth_date: true,
        partner_birth_time: true,
        partner_birth_place: true,
        relationship_start_date: true,
      }
    });
  }

// Hàm "chia tay"
static async removePartner(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      partner_name: null,
      partner_gender: null,
      partner_birth_date: null,
      partner_birth_time: null,
      partner_birth_place: null,
      relationship_start_date: null,
    }
  });
}

}