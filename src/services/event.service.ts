import { PrismaClient } from '@prisma/client';
import { PartnerService } from './partner.service';

const prisma = new PrismaClient();

type EventData = {
  partner_name?: string;
  event_date: string;
  event_type: string;
  details?: string;
};

type EventUpdateData = Partial<Omit<EventData, 'event_date'>> & { event_date?: string };


export class EventService {
  
  // CREATE: Người dùng tự thêm một sự kiện cá nhân
  // static async createEvent(userId: string, data: EventData) {
  //   return prisma.personalEvent.create({
  //     data: {
  //       ...data,
  //       event_date: new Date(data.event_date),
  //       user_id: userId,
  //     }
  //   });
  // }
  static async createEvent(userId: string, data: Omit<EventData, 'partner_name'>) {
    // 1. TÌM PARTNER HIỆN TẠI
    const activePartner = await PartnerService.findActivePartner(userId);
    if (!activePartner) {
        throw new Error("Cannot create event: User is not in an active relationship.");
    }
    
    // 2. Tự động điền tên partner và tạo event
    return prisma.personalEvent.create({
      data: {
        ...data,
        event_date: new Date(data.event_date),
        user_id: userId,
        partner_name: activePartner.name, 
      }
    });
  }

  // READ: Lấy tất cả sự kiện của một user
  static async getEventsByUserId(userId: string) {
    return prisma.personalEvent.findMany({
      where: { user_id: userId },
      orderBy: { event_date: 'desc' }, // Sắp xếp theo ngày diễn ra sự kiện
    });
  }

  // READ: Lấy một sự kiện cụ thể (và kiểm tra quyền sở hữu)
  static async getEventById(userId: string, eventId: string) {
    return prisma.personalEvent.findFirst({
      where: { id: eventId, user_id: userId },
    });
  }

  // UPDATE: Cập nhật một sự kiện
  static async updateEvent(userId: string, eventId: string, data: EventUpdateData) {
    return prisma.personalEvent.updateMany({
      where: {
        id: eventId,
        user_id: userId, // Đảm bảo chỉ user sở hữu mới được cập nhật
      },
      data: {
        ...data,
        event_date: data.event_date ? new Date(data.event_date) : undefined,
      },
    });
  }

  // DELETE: Xóa một sự kiện
  static async deleteEvent(userId: string, eventId: string) {
    return prisma.personalEvent.deleteMany({
      where: {
        id: eventId,
        user_id: userId, // Đảm bảo chỉ user sở hữu mới được xóa
      },
    });
  }
}