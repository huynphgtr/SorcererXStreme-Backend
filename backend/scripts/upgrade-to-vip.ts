import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upgradeToVIP() {
  try {
    // Lấy email từ command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Vui lòng cung cấp email: npm run upgrade-vip <email>');
      process.exit(1);
    }

    // Tìm user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ Không tìm thấy user với email: ${email}`);
      process.exit(1);
    }

    console.log(`\n📧 Tìm thấy user: ${user.email} (${user.name || 'Chưa có tên'})`);
    console.log(`📊 Tier hiện tại: ${user.vip_tier}`);

    // Set VIP expire date (1 year from now for testing)
    const vipExpiresAt = new Date();
    vipExpiresAt.setFullYear(vipExpiresAt.getFullYear() + 1);

    // Update user to VIP
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        vip_tier: 'VIP',
        vip_expires_at: vipExpiresAt
      }
    });

    // Reset usage stats
    await prisma.usageStats.deleteMany({
      where: { user_id: user.id }
    });

    await prisma.usageStats.create({
      data: {
        user_id: user.id,
        tarot_readings_today: 0,
        chat_messages_today: 0,
        astrology_today: 0,
        fortune_today: 0,
        numerology_today: 0,
        last_reset_date: new Date()
      }
    });

    console.log('\n✅ Nâng cấp VIP thành công!');
    console.log(`👑 Tier mới: ${updatedUser.vip_tier}`);
    console.log(`⏰ Hết hạn: ${vipExpiresAt.toLocaleString('vi-VN')}`);
    console.log(`🔄 Đã reset usage stats`);
    console.log('\n💎 Bạn có thể sử dụng tất cả tính năng không giới hạn!');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeToVIP();