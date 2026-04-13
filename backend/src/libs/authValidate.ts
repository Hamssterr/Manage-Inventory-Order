import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    firstName: z
      .string({ message: "First name is required" })
      .trim()
      .min(2, "First name must be at least 2 characters"),

    lastName: z
      .string({ message: "Last name is required" })
      .trim()
      .min(2, "Last name must be at least 2 characters"),

    email: z
      .string({ message: "Email is required" })
      .email("Invalid email format"),

    phoneNumber: z
      .string({ message: "Phone number is required" })
      .regex(
        /(84|0[3|5|7|8|9])+([0-9]{8})\b/g,
        "Invalid Vietnamese phone number",
      ),

    // password: z
    //   .string({ message: "Password is required" })
    //   .min(8, "Password must be at least 8 characters")
    //   .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    //   .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    //   .regex(/[0-9]/, "Password must contain at least one number")
    //   .regex(
    //     /[@$!%*?&]/,
    //     "Password must contain at least one special character",
    //   ),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const updateSchema = z.object({
  body: z.object({
    displayName: z.string().min(2, "Name too short").optional(),

    // Kiểm tra email: dùng .email() là đủ, Zod sẽ chặn "123" ngay
    email: z.string().email("Email is incorrect").optional(),

    // Sửa lỗi phoneNumber:
    // 1. Thêm .optional() nếu không muốn bắt buộc cập nhật
    // 2. Tham số của .regex() nên là (regex, message) trực tiếp
    phoneNumber: z
      .string()
      .regex(
        /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
        "Invalid Vietnamese phone number",
      )
      .optional(),

    avatarUrl: z.string().url("Link is incorrect").optional(),
    role: z.enum(["owner", "admin", "salers", "accountant"]).optional(),
  }),
});

export type UpdateUserDto = z.infer<typeof updateSchema>["body"];
