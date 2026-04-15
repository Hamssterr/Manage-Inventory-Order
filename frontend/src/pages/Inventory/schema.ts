import { z } from "zod";

// Luật cho 1 Đơn vị tính
export const unitSchema = z.object({
  unitName: z.string().min(1, "Vui lòng chọn tên đơn vị"),
  exchangeValue: z.number().min(1, "Quy đổi tối thiểu là 1"),
  priceDefault: z.number().min(0, "Giá không được âm"),
  isDefault: z.boolean(),
});

// Form update và create
export const inventorySchema = z
  .object({
    name: z.string().trim().min(1, "Tên sản phẩm không được để trống"),
    sku: z.string().trim().min(1, "Mã SKU không được để trống"),
    category: z.string().min(1, "Vui lòng chọn danh mục"),
    baseUnit: z.string().min(1, "Vui lòng chọn đơn vị tính"),
    isSale: z.boolean(),
    isGift: z.boolean(),
    units: z.array(unitSchema).min(1, "Cần ít nhất 1 đơn vị tính"),
  })
  .superRefine((data, ctx) => {
    if (!data) return;

    const isValidBaseUnit = data.units.some(
      (unit) => unit.unitName === data.baseUnit && unit.exchangeValue === 1,
    );
    if (!isValidBaseUnit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Đơn vị cơ bản [${data.baseUnit}] phải có trong danh sách thiết lập với "Giá trị quy đổi" = 1.`,
        path: ["units", 0, "unitName"],
      });
    }
  });

export const importInventorySchema = z.object({
  unitName: z.string().min(1, "Vui lòng chọn đơn vị"),
  quantity: z.number().min(1, "Số lượng nhập tối thiểu là 1"),
  note: z.string().optional(),
});

// Export Type tự động sinh ra từ Schema để dùng cho các component khác
export type InventoryFormValues = z.infer<typeof inventorySchema>;
export type ImportInventoryFormValues = z.infer<typeof importInventorySchema>;
