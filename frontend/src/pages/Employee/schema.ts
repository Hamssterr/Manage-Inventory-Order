import z from "zod";

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const employeeSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Tên nhân viên có ít nhất 2 kí tự" })
    .max(50, { message: "Tên nhân viên không được vượt quá 50 ký tự" }),
  phoneNumber: z.string().regex(phoneRegex, {
    message: "Số điện thoại không hợp lệ (VD: 0901234567)",
  }),
  email: z
    .string({ message: "Email là bắt buộc" })
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  role: z.enum(["salers", "accountant"], {
    message: "Vui lòng chọn chức vụ",
  }),
});

export const exportSalarySchema = z.object({
  month: z.number().min(1, "Tháng không hợp lệ").max(12, "Tháng không hợp lệ"),
  year: z.number().min(1900, "Năm không hợp lệ").max(2100, "Năm không hợp lệ"),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type ExportSalaryFormValues = z.infer<typeof exportSalarySchema>;
