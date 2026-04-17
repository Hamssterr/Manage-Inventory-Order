import * as z from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Tên khách hàng không được để trống"),
  phoneNumber: z.string().min(1, "Số điện thoại không được để trống"),
  taxCode: z.string().optional(),
  addresses: z.object({
    addressDetail: z.string().min(1, "Chi tiết địa chỉ không được để trống"),
    ward: z.string().min(1, "Phường/Xã không được để trống"),
    district: z.string().min(1, "Quận/Huyện không được để trống"),
    province: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
    routeId: z.string().optional(),
  }),
  saleRep: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
  