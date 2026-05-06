import { z } from "zod";

// Schema cho từng item trong đơn hàng
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  productNameSnapshot: z.string().optional(),
  unitName: z.string().min(1, "Vui lòng chọn đơn vị tính"),
  quantity: z.number().positive("Số lượng phải lớn hơn 0"),
  deliveredQuantity: z.number().min(0).optional(),
  price: z.number().optional(), // Lưu giá tại thời điểm chọn
  skuSnapshot: z.string().optional(),
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
  .superRefine((data, ctx) => {
    if (data.isGuest) {
      if (!data.guestName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập tên khách hàng",
          path: ["guestName"],
        });
      }
      if (!data.guestPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập số điện thoại",
          path: ["guestPhone"],
        });
      }
      if (!data.guestAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng nhập địa chỉ",
          path: ["guestAddress"],
        });
      }
    } else {
      if (!data.customerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng chọn khách hàng",
          path: ["customerId"],
        });
      }
      if (!data.saleId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng chọn nhân viên phụ trách",
          path: ["saleId"],
        });
      }
    }
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
