import transporter from "../config/mail.js";
import dotenv from "dotenv";

dotenv.config();

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions) => {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME || "Manage Inventory"}" <${process.env.MAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Các hàm helper cho các loại email cụ thể
 */
export const mailService = {
  // Gửi email chào mừng khi tạo tài khoản
  sendWelcomeEmail: async (
    email: string,
    displayName: string,
    hashedPassword: string,
  ) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1e293b;">Chào mừng ${displayName}!</h2>
        <p>Quản trị viên đã tạo tài khoản cho bạn trên hệ thống Quản lý Kho.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <span style="color: #2563eb; font-weight: bold; font-size: 1.2rem;">${hashedPassword}</span></p>
        </div>
        <p style="color: #ef4444; font-size: 0.9rem;">* Lưu ý: Vui lòng đăng nhập và thay đổi mật khẩu ngay để đảm bảo an toàn.</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: "Chào mừng bạn đến với Manage Inventory",
      html,
    });
  },

  // Gửi email quên mật khẩu
  sendForgotPasswordEmail: async (email: string, resetLink: string) => {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #3b82f6;">Yêu cầu đặt lại mật khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Vui lòng nhấn vào nút bên dưới để tiến hành đặt lại mật khẩu (link có hiệu lực trong 1 giờ):</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
        </div>
        <p>Nếu bạn không yêu cầu việc này, vui lòng bỏ qua email này.</p>
      </div>
    `;

    return sendEmail({
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu - Manage Inventory",
      html,
    });
  },

  // Gửi email Reset Password
  sendResetPasswordEmail: async (
    email: string,
    displayName: string,
    newHashedPassword: string,
  ) => {
    const html = `
      <div style="font-family: Arial, sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb;">Mật khẩu của bạn đã được thay đổi</h2>
          <p>Chào <strong>${displayName}</strong>,</p>
          <p>Theo yêu cầu từ Admin, mật khẩu của bạn đã được reset thành công.</p>
          <div style="background: #f1f5f9; padding: 15px; text-align: center; border-radius: 5px;">
            <p style="margin: 0; font-size: 0.9rem;">Mật khẩu mới của bạn là:</p>
            <h1 style="letter-spacing: 2px; color: #0f172a;">${newHashedPassword}</h1>
          </div>
          <p style="color: #64748b; font-size: 0.8rem; margin-top: 20px;">
            Vui lòng đăng nhập và đổi mật khẩu ngay lập tức để bảo mật thông tin.
          </p>
        </div>
      `;

    return sendEmail({
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu - Manage Inventory",
      html,
    });
  },
};
