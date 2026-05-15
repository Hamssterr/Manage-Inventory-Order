import User from "../models/User.js";
import bcrypt from "bcrypt";

export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminExisting = await User.findOne({
      role: { $in: ["admin"] },
    });
    if (adminExisting) {
      console.log(
        "[Seeding] Hệ thống đã có tài khoản Quản trị. Bỏ qua bước khởi tạo ban đầu.",
      );
      return;
    }

    const phone = process.env.INITIAL_ADMIN_PHONE;
    const password = process.env.INITIAL_ADMIN_PASSWORD;
    const email = process.env.INITIAL_ADMIN_EMAIL;
    const displayName = process.env.INITIAL_ADMIN_NAME || "Quản Trị Viên";

    if (!phone || !password || !email) {
      console.warn(
        "⚠️ [Seeding-Warning] Vui lòng cấu hình đầy đủ INITIAL_ADMIN_PHONE, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_EMAIL trong biến môi trường để tự động tạo tài khoản Admin.",
      );
      return;
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      phoneNumber: cleanPhone,
      hashedPassword: hashedPassword,
      email: cleanEmail,
      displayName,
      role: "admin",
    });
  } catch (error: any) {
    console.error(
      `[Seeding-Error] Lỗi khi khởi tạo tài khoản quản trị ban đầu: ${error.message}`,
    );
  }
};
