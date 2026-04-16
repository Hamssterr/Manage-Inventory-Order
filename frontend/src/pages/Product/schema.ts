import { z } from "zod";

export const comboComponentSchema = z.object({
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  quantityPerBaseUnit: z.number().min(1, "Số lượng tối thiểu là 1"),
});

export const unitSchema = z.object({
  unitName: z.string().min(1, "Vui lòng chọn tên đơn vị"),
  exchangeValue: z.number().min(1, "Quy đổi tối thiểu là 1"),
  priceDefault: z.number().min(0, "Giá không được âm"),
  isDefault: z.boolean(),
});

export const comboProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  sku: z.string().min(1, "Mã SKU không được để trống"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  baseUnit: z.string().min(1, "Vui lòng chọn đơn vị tính"),
  isSale: z.boolean(),

  components: z
    .array(comboComponentSchema)
    .min(2, "Combo phải có ít nhất 2 sản phẩm"),
  units: z.array(unitSchema).min(1, "Phải có ít nhất 1 đơn vị tính"),
});

export type ComboFormValues = z.infer<typeof comboProductSchema>;
