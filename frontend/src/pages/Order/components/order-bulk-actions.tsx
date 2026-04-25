import { Button } from "@/components/ui/button";
import { Truck, XCircle, X, Undo2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderBulkActionsProps {
  status: string;
  selectedIds: string[];
  onClear: () => void;
  onAction: (ids: string[], type: string) => void;
  isPending?: boolean;
}

type BulkActionDef = {
  label: (count: number) => string;
  icon: React.ElementType;
  nextStatus: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
};

export const OrderBulkActions = ({
  status,
  selectedIds,
  onClear,
  onAction,
  isPending,
}: OrderBulkActionsProps) => {
  if (selectedIds.length === 0) return null;

  const ACTION_CONFIG: Record<string, BulkActionDef[]> = {
    pending: [
      {
        label: (count: any) => `Xác nhận ${count} đơn`,
        icon: Check,
        nextStatus: "confirmed",
        className: "bg-green-600 hover:bg-green-700 shadow-green-500/20",
      },
      {
        label: () => "Hủy đơn",
        icon: XCircle,
        nextStatus: "cancelled",
        variant: "destructive",
      },
    ],
    confirmed: [
      {
        label: () => "Xuất phiếu kho",
        icon: Truck,
        nextStatus: "shipping",
        className: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
      },
      {
        label: () => "Hủy đơn",
        icon: XCircle,
        nextStatus: "cancelled",
        variant: "destructive",
      },
    ],
    shipping: [
      {
        label: () => "Hoàn tất",
        icon: Check,
        nextStatus: "delivered",
        className: "bg-green-600 hover:bg-green-700 shadow-green-500/20",
      },
      {
        label: () => "Không lấy",
        icon: XCircle,
        nextStatus: "cancelled",
        variant: "destructive",
      },
    ],
    delivered: [
      {
        label: () => "Hoàn tác",
        icon: Undo2,
        nextStatus: "confirmed",
        className: "bg-green-600 hover:bg-green-700 shadow-green-500/20",
      },
    ],
    cancelled: [
      {
        label: () => "Hoàn tác",
        icon: Undo2,
        nextStatus: "confirmed",
        className: "bg-green-600 hover:bg-green-700 shadow-green-500/20",
      },
    ],
    "": [
      {
        label: () => "Xóa vĩnh viễn",
        icon: XCircle,
        nextStatus: "delete",
        variant: "destructive",
      },
    ],
  };

  const currentAction = ACTION_CONFIG[status] || [];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 w-max max-w-[95vw]">
      <div className="bg-slate-900 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-6 border border-slate-800 backdrop-blur-md bg-opacity-95 overflow-hidden">
        {/* Chỉ số đếm */}
        <div className="flex items-center gap-2 sm:gap-3 pr-3 sm:pr-6 border-r border-slate-700 shrink-0">
          <div className="bg-primary h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold">
            {selectedIds.length}
          </div>
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap hidden sm:inline">
            Đã chọn
          </span>
        </div>

        {/* Các nút hành động */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 sm:h-9 px-2 sm:px-3"
            onClick={onClear}
            disabled={isPending}
          >
            <X className="h-3.5 w-3.5 sm:mr-2" />
            <span className="hidden sm:inline text-xs sm:text-sm">Bỏ chọn</span>
          </Button>

          {currentAction.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.nextStatus + index}
                variant={action.variant || "default"}
                size={"sm"}
                className={cn(
                  "h-8 sm:h-9 px-3 sm:px-4 shadow-lg transition-all active:scale-95 whitespace-nowrap text-xs sm:text-sm",
                  action.className,
                )}
                disabled={isPending}
                onClick={() => onAction(selectedIds, action.nextStatus)}
              >
                <Icon className="h-3.5 w-3.5 sm:mr-2" />
                <span>
                  {isPending ? "..." : action.label(selectedIds.length)}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
