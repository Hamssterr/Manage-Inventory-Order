import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IOrder } from "@/types/order";
import { format } from "date-fns";
import { FileText, Route as RouteIcon, User } from "lucide-react";
import type { ColumnDef } from "@/components/table-data";
import { ORDER_STATUS } from "@/constants/order-status";

export const OrderColumns = (): ColumnDef<IOrder & { id: string }>[] => [
  {
    header: "Mã đơn hàng",
    className: "w-[180px]",
    cell: (row) => (
      <div className="flex items-center gap-3 py-1">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
          <FileText className="h-4.5 w-4.5 text-slate-600" />
        </div>
        <span className="font-bold text-slate-900 tracking-tight">
          {row.orderCode}
        </span>
      </div>
    ),
  },
  {
    header: "Khách hàng",
    className: "w-[220px]",
    cell: (row) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-foreground line-clamp-1">
            {row.customerNameSnapshot} -
          </span>
          <span className="text-muted-foreground">
            {row.customerPhoneSnapshot}
          </span>
        </div>
        <span className="text-xs text-muted-foreground mt-0.5">
          {row.deliveryAddressSnapshot}
        </span>
      </div>
    ),
  },
  {
    header: "Tuyến đường / Sale",
    className: "w-[200px]",
    cell: (row) => {
      return (
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <RouteIcon className="h-3 w-3 text-slate-400" />
            <span className="line-clamp-1">
              {row.routeId === "object"
                ? (row.routeId as any)?.routeName
                : "Chưa có tuyến đường"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>
              {typeof row.saleId === "object"
                ? (row.saleId as any)?.displayName || "N/A"
                : "Hệ thống"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    header: "Trạng thái",
    className: "w-[150px]",
    cell: (row) => {
      const config = ORDER_STATUS[row.status] || {
        label: row.status,
        color: "bg-slate-100 text-slate-700",
      };
      return (
        <Badge
          variant="outline"
          className={cn(
            "px-2.5 py-0.5 rounded-full font-medium border shadow-none",
            config.color,
          )}
        >
          {config.label}
        </Badge>
      );
    },
  },
  {
    header: "Ngày tạo",
    className: "w-[100px] ",
    cell: (row) => (
      <div className="flex flex-col text-sm">
        <span>{format(new Date(row.createdAt), "dd/MM/yyyy")}</span>
        <span className="text-[10px] opacity-70">
          {format(new Date(row.createdAt), "HH:mm")}
        </span>
      </div>
    ),
  },
  {
    header: "Tổng tiền",
    className: "w-[120px] text-end pr-4 font-bold text-primary",
    cell: (row) => (
      <span>{new Intl.NumberFormat("vi-VN").format(row.totalAmount)} đ</span>
    ),
  },
];
