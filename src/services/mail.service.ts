import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "ap-southeast-1" }); 

export class MailService {
  static async sendDailyUpdate(toEmail: string, userName: string) {
    const params = {
      Source: process.env.SES_FROM_EMAIL, 
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: "Thông báo từ SorcererXStreme", Charset: "UTF-8" },
        Body: {
          Html: {
            Data: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4a2375;">Chào ${userName},</h2>
                    <p style="font-size: 16px; line-height: 1.6;">Vũ trụ đã gửi đến một tín hiệu đặc biệt cho bạn. Hôm nay, bạn được nhắc nhở về tầm quan trọng của sự cân bằng.</p>

                    <div style="background-color: #f7f0ff; padding: 20px; margin-top: 25px; border-radius: 8px;">
                        <h3 style="color: #6a40a5; margin-top: 0;">Gợi ý Năng lượng Bí ẩn:</h3>
                        <p style="font-style: italic; font-size: 16px; margin-bottom: 5px;">"Một sự kiện bất ngờ sẽ xảy ra, thử thách cách bạn đón nhận thay đổi."</p>
                        <p style="font-style: italic; font-size: 16px; margin-top: 5px;">"...Vậy... Yếu tố nào sẽ là chìa khóa giúp bạn vượt qua thử thách này?"</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://main.d30n5a8g6cs88k.amplifyapp.com/" style="background-color: #6a40a5; color: white; padding: 15px 30px; text-align: center; text-decoration: none; display: inline-block; font-size: 18px; border-radius: 8px; font-weight: bold; transition: background-color 0.3s;">
                            Khám phá Câu trả lời Chi tiết NGAY!
                        </a>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #777;">
                        <p>Đây là thông báo từ SorcererXStreme gửi đến bạn.</p>
                    </div>
                </div>`,
            Charset: "UTF-8",
          },
        },
      },
    };

    try {
      await sesClient.send(new SendEmailCommand(params));
      return true;
    } catch (error) {
      console.error(`Gửi lỗi tới ${toEmail}:`, error);
      return false;
    }
  }
}