import z from "zod";

export const routeSchema = z.object({
  routeName: z.string().min(1, "Tên tuyến đường không được để trống"),
  description: z.string().optional(),
  responsibleSale: z
    .array(z.string())
    .min(1, "Vui lòng chọn ít nhất một nhân viên tiếp thị"),
});

export type RouteFormValues = z.infer<typeof routeSchema>;
