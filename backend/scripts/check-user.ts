import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('\nDanh sach tat ca users:\n');
      const users = await prisma.user.findMany({
        include: {
          usageStats: true
        }
      });

      if (users.length === 0) {
        console.log('Khong co user nao trong database');
        process.exit(0);
      }

      for (const user of users) {
        console.log(`\nEmail: ${user.email}`);
        console.log(`Ten: ${user.name || 'Chua co'}`);
        console.log(`Tier: ${user.vip_tier}`);
        console.log(`VIP het han: ${user.vip_expires_at ? user.vip_expires_at.toLocaleString('vi-VN') : 'N/A'}`);
        
        if (user.usageStats) {
          console.log(`Usage hom nay:`);
          console.log(`   - Tarot: ${user.usageStats.tarot_readings_today}`);
          console.log(`   - Chat: ${user.usageStats.chat_messages_today}`);
          console.log(`   - Chiem tinh: ${user.usageStats.astrology_today}`);
          console.log(`   - Tu vi: ${user.usageStats.fortune_today}`);
          console.log(`   - Than so hoc: ${user.usageStats.numerology_today}`);
          console.log(`   - Reset lan cuoi: ${user.usageStats.last_reset_date.toLocaleString('vi-VN')}`);
        } else {
          console.log(`Chua co usage stats`);
        }
        console.log('─'.repeat(50));
      }
    } else {
      // Tim user cu the
      const user = await prisma.user.findUnique({
        where: { email },
        include: { usageStats: true }
      });

      if (!user) {
        console.error(`Khong tim thay user voi email: ${email}`);
        process.exit(1);
      }

      console.log(`\nEmail: ${user.email}`);
      console.log(`Ten: ${user.name || 'Chua co'}`);
      console.log(`Tier: ${user.vip_tier}`);
      console.log(`VIP het han: ${user.vip_expires_at ? user.vip_expires_at.toLocaleString('vi-VN') : 'N/A'}`);
      
      if (user.usageStats) {
        console.log(`\nUsage hom nay:`);
        console.log(`   - Tarot: ${user.usageStats.tarot_readings_today}`);
        console.log(`   - Chat: ${user.usageStats.chat_messages_today}`);
        console.log(`   - Chiem tinh: ${user.usageStats.astrology_today}`);
        console.log(`   - Tu vi: ${user.usageStats.fortune_today}`);
        console.log(`   - Than so hoc: ${user.usageStats.numerology_today}`);
        console.log(`   - Reset lan cuoi: ${user.usageStats.last_reset_date.toLocaleString('vi-VN')}`);
      } else {
        console.log(`\nChua co usage stats`);
      }
    }

  } catch (error) {
    console.error('Loi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

