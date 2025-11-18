import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type PartnerData = {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  relationship_type?: string;
};

type PartnerUpdateData = Partial<PartnerData>; 

const RELATIONSHIP_EVENTS = ['RELATIONSHIP_START', 'RELATIONSHIP_END', 'MARRIAGE_UNION'];

export class PartnerService {

  static async findActivePartner(userId: string) {
    // 1. Tìm sự kiện quan hệ cuối cùng của user
    const lastRelationshipEvent = await prisma.personalEvent.findFirst({
      where: {
        user_id: userId,
        event_type: { in: RELATIONSHIP_EVENTS },
      },
      orderBy: { event_date: 'desc' },
    });  

    // 2. Nếu không có sự kiện nào, hoặc sự kiện cuối cùng là KẾT THÚC -> user độc thân
    if (!lastRelationshipEvent || lastRelationshipEvent.event_type === 'RELATIONSHIP_END') {
      return null; // Không có partner active
    }

    // 3. Nếu sự kiện cuối cùng là BẮT ĐẦU hoặc KẾT HÔN -> tìm partner tương ứng
    // Giả định rằng partner_name trong event là duy nhất tại thời điểm đó
    const partner = await prisma.partner.findFirst({
        where: {
            user_id: userId,
            name: lastRelationshipEvent.partner_name!
        }
    });

    return partner;
  }

  // CREATE: Thêm một partner mới và tạo event "Bắt đầu mối quan hệ"
  // static async createPartner(userId: string, data: PartnerData) {
  //   return prisma.$transaction(async (tx) => {
  //     const newPartner = await tx.partner.create({
  //       data: {
  //         ...data,
  //         birth_date: new Date(data.birth_date),
  //         user_id: userId,
  //       },
  //     });

  //     await tx.personalEvent.create({
  //       data: {
  //         user_id: userId,
  //         partner_name: newPartner.name,
  //         event_date: new Date(), 
  //         event_type: 'Relationship Started',
  //         details: `Started a relationship with ${newPartner.name}.`,
  //       },
  //     });

  //     return newPartner;
  //   });
  // }

  static async createPartner(userId: string, data: PartnerData) {
    const activePartner = await this.findActivePartner(userId);
    if (activePartner) {
      throw new Error(`User is already in an active relationship with ${activePartner.name}.`);
    }
    return prisma.$transaction(async (tx) => {
      const newPartner = await tx.partner.create({
        data: {
          ...data,
          birth_date: new Date(data.birth_date),
          user_id: userId,
        },
      });

      await tx.personalEvent.create({
        data: {
          user_id: userId,
          partner_name: newPartner.name,
          event_date: new Date(),
          event_type: 'RELATIONSHIP_START', 
          details: `Started a relationship with ${newPartner.name}.`,
        },
      });

      return newPartner;
    });
  }

  // READ: Lấy tất cả partner của một user
  static async getPartnersByUserId(userId: string) {
    return prisma.partner.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  // READ: Lấy một partner cụ thể (và kiểm tra quyền sở hữu)
  static async getPartnerById(userId: string, partnerId: string) {
    return prisma.partner.findFirst({
      where: { id: partnerId, user_id: userId },
    });
  }

  // UPDATE: Cập nhật thông tin partner
  static async updatePartner(userId: string, partnerId: string, data: PartnerUpdateData) {
     return prisma.$transaction(async (tx) => {
        // Lấy thông tin partner hiện tại để so sánh
        const currentPartner = await tx.partner.findFirst({
            where: { id: partnerId, user_id: userId }
        });

        if (!currentPartner) {
            throw new Error('Partner not found or user does not have permission.');
        }

        // Cập nhật partner
        const updatedPartner = await tx.partner.update({
            where: { id_user_id: { id: partnerId, user_id: userId } }, // Dùng composite key
            data: {
                ...data,
                birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
            },
        });
        
        // // Logic tạo sự kiện nếu mối quan hệ thay đổi
        // if (data.relationship_type && data.relationship_type !== currentPartner.relationship_type) {
        //     let event_type = 'Relationship Change';
        //     let details = `Relationship with ${updatedPartner.name} changed to '${data.relationship_type}'.`;
        //     if (data.relationship_type.toLowerCase().includes('married')) event_type = 'Got Married';
        //     if (data.relationship_type.toLowerCase().includes('breakup')) event_type = 'Broke Up';

        //     await tx.personalEvent.create({
        //         data: {
        //             user_id: userId,
        //             partner_name: updatedPartner.name,
        //             event_date: new Date(),
        //             event_type: event_type,
        //             details: details
        //         }
        //     });
        // }
        return updatedPartner;
    });
  }

  // DELETE: Xóa một partner
  static async deletePartner(userId: string, partnerId: string) {
    // Prisma sẽ tự động báo lỗi nếu không tìm thấy record khớp với cả partnerId và userId
    // Điều này đảm bảo người dùng chỉ có thể xóa partner của chính họ.
    return prisma.partner.delete({
      where: { id_user_id: { id: partnerId, user_id: userId } }, // Dùng composite key
    });
  }

  // static async deletePartner(userId: string, partnerId: string) {
  //   return prisma.$transaction(async (tx) => {
  //       const partnerToDelete = await tx.partner.findFirst({
  //           where: { id: partnerId, user_id: userId }
  //       });

  //       if (!partnerToDelete) {
  //           throw new Error('Partner not found or user does not have permission.');
  //       }

  //       // 1. TẠO SỰ KIỆN KẾT THÚC TRƯỚC
  //       await tx.personalEvent.create({
  //           data: {
  //               user_id: userId,
  //               partner_name: partnerToDelete.name,
  //               event_date: new Date(),
  //               event_type: 'RELATIONSHIP_END',
  //               details: `Ended relationship with ${partnerToDelete.name}.`
  //           }
  //       });

  //       // 2. Sau đó mới xóa partner
  //       await tx.partner.delete({
  //           where: { id_user_id: { id: partnerId, user_id: userId } },
  //       });

  //       return { message: "Partner deleted and relationship ended." };
  //   });
  // }
}