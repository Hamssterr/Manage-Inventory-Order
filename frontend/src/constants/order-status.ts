import type { OrderStatus } from "@/types/order";

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  pending: {
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  shipping: {
    label: "Đang giao hàng",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  delivered: {
    label: "Đã giao",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Đã huỷ",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

export const statusOptions = [
  { label: "Tất cả", value: "" },
  ...Object.entries(ORDER_STATUS).map(([key, value]) => ({
    label: value.label,
    value: key,
  })),
];
