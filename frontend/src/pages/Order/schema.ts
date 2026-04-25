import { z } from "zod";

// Schema cho từng item trong đơn hàng
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  productNameSnapshot: z.string().optional(),
  unitName: z.string().min(1, "Vui lòng chọn đơn vị tính"),
  quantity: z.number().positive("Số lượng phải lớn hơn 0"),
  price: z.number().optional(), // Lưu giá tại thời điểm chọn
  note: z.string().optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  customerNameSnapshot: z.string().optional(),
  saleId: z.string().min(1, "Vui lòng chọn nhân viên bán hàng"),
  saleNameSnapshot: z.string().optional(),
  note: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

// Schema cho tạo đơn hàng khách vãng lai (Guest)
export const createGuestOrderSchema = z.object({
  guestName: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  guestPhone: z.string().min(10, "Số điện thoại không hợp lệ"),
  guestAddress: z.string().min(1, "Vui lòng nhập địa chỉ"),
  guestTaxCode: z.string().optional(),
  note: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

// Types inferred from schemas for use in forms
export type OrderItemFormValues = z.infer<typeof orderItemSchema>;
export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
export type CreateGuestOrderFormValues = z.infer<typeof createGuestOrderSchema>;
