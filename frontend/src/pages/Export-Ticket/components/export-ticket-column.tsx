import type { ColumnDef } from "@/components/table-data";
import { cn } from "@/lib/utils";
import type { IExportTicket } from "@/types/export-ticket";
import { format } from "date-fns";
import { FileText } from "lucide-react";

export const ExportTicketColumn = (): ColumnDef<
  IExportTicket & { id: string }
>[] => [
  {
    header: "Mã phiếu",
    className: "w-[280px]",
    cell: (row) => (
      <div className="flex items-center gap-3 py-1">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
          <FileText className="h-4.5 w-4.5 text-slate-600" />
        </div>
        <span className="font-bold text-slate-900 tracking-tight">
          {row.ticketCode}
        </span>
      </div>
    ),
  },
  {
    header: "Tuyến đường",
    className: "w-[300px]",
    cell: (row) => {
      const route = row.routeId;
      const routeName = typeof route === "object" ? route.routeName : "---";

      return (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">{routeName}</span>
        </div>
      );
    },
  },
  {
    header: "Ngày tạo",
    className: "w-[150px] ",
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
    header: "Tổng số hóa đơn",
    className: "w-[150px] font-bold text-center",
    cell: (row) => (
      <div>
        <span className="font-medium">{row.orderIds.length}</span>
      </div>
    ),
  },
  {
    header: "Tổng số lượng",
    className: "w-[150px] font-bold text-center",
    cell: (row) => (
      <div>
        <span className="font-medium">
          {row.aggregatedItems.reduce(
            (acc, item) => acc + item.totalQuantity,
            0,
          )}
        </span>
      </div>
    ),
  },
  {
    header: "Trạng thái",
    className: "w-[120px]",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
            row.status === "exported"
              ? "bg-blue-50 text-blue-600 border-blue-100"
              : row.status === "completed"
                ? "bg-green-50 text-green-600 border-green-100"
                : "bg-slate-50 text-slate-600 border-slate-100",
          )}
        >
          {row.status === "exported"
            ? "Đã xuất"
            : row.status === "completed"
              ? "Hoàn thành"
              : row.status}
        </span>
      </div>
    ),
  },
];
