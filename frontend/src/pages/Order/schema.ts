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

export const createOrderSchema = z
  .object({
    isGuest: z.boolean(),
    // Fields for normal order
    customerId: z.string().optional(),
    customerNameSnapshot: z.string().optional(),

    // Fields for guest order
    guestName: z.string().optional(),
    guestPhone: z.string().optional(),
    guestAddress: z.string().optional(),
    guestTaxCode: z.string().optional(),

    saleId: z.string().optional(),
    saleNameSnapshot: z.string().optional(),
    note: z.string().optional(),
    items: z
      .array(orderItemSchema)
      .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
  })
  .refine(
    (data) => {
      if (data.isGuest) {
        return !!data.guestName && !!data.guestPhone && !!data.guestAddress;
      }
      return !!data.customerId && !!data.saleId;
    },
    {
      message:
        "Vui lòng nhập đầy đủ thông tin khách hàng và nhân viên phụ trách",
      path: ["customerId"],
    },
  );

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
