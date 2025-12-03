import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({ region: "ap-southeast-1" }); 

export class MailService {
  static async sendDailyUpdate(toEmail: string, userName: string) {
    const params = {
      Source: process.env.SES_FROM_EMAIL || "tranphuonghuyen2005@gmail.com", 
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: "Thông báo từ SorcererXStreme", Charset: "UTF-8" },
        Body: {
          Html: {
            Data: `<h3>Xin chào ${userName},</h3><p>Đây là thông báo từ SorcererXStreme gửi đến bạn.</p>`,
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