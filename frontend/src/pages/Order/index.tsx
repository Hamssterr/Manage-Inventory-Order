import { FilterBar } from "@/components/filter-bar";
import { PageFooter } from "@/components/footer";
import { TableData } from "@/components/table-data";
import { TableError, TableLoading } from "@/components/table-loading";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { useGetAllOrdersQuery, useOrderActions } from "@/hooks/useOrder";
import { useGetAllRouteQuery } from "@/hooks/useRoute";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { DateRange } from "react-day-picker";
import { statusOptions } from "@/constants/order-status";
import { keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import các sub-components đã tách
import { OrderColumns } from "./components/order-columns";
import { OrderBulkActions } from "./components/order-bulk-actions";
import { ReconcileOrderDialog } from "./components/reconcile-order-dialog";

export const OrderPage = () => {
  const { hasRole } = usePermission();
  const navigate = useNavigate();
  const {
    onDeleteOrder,
    onConfirmOrders,
    onCancelOrders,
    onBulkReconcileOrders,
    onCancelDeliveryOrder,
    onRollbackOrderDelivery,
    onCreateExportTicket,
    isPending: isOrderActionPending,
  } = useOrderActions();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. URL State Management
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const routeId = searchParams.get("routeId") || "";
  const status = searchParams.get("status") || "";
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const limit = Number(searchParams.get("limit")) || 15;

  const [orderIdToDelete, setOrderIdToDelete] = useState<string | null>(null);
  const [orderIdToReconcile, setOrderIdToReconcile] = useState<string | null>(
    null,
  );
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const dateRange = useMemo(
    () =>
      !startDateStr && !endDateStr
        ? undefined
        : ({
            from: startDateStr ? new Date(startDateStr) : undefined,
            to: endDateStr ? new Date(endDateStr) : undefined,
          } as DateRange),
    [startDateStr, endDateStr],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            value === undefined || value === ""
              ? newParams.delete(key)
              : newParams.set(key, value);
          });
          return newParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // 2. Data Fetching
  const { data, isLoading, isError, refetch, isFetching } =
    useGetAllOrdersQuery(
      {
        limit,
        page,
        search: search || undefined,
        routeId: routeId || undefined,
        status: status || undefined,
        startDate: dateRange?.from?.toISOString(),
        endDate: dateRange?.to?.toISOString(),
      },
      { placeholderData: keepPreviousData },
    );

  const { data: routeData } = useGetAllRouteQuery({ limit: 100 });

  const routeOptions = useMemo(
    () =>
      routeData?.data.map((r) => ({ label: r.routeName, value: r._id })) || [],
    [routeData],
  );
  const orders = useMemo(
    () => data?.data.map((item) => ({ ...item, id: item._id })) || [],
    [data],
  );
  const columns = useMemo(() => OrderColumns(), []);

  // 3. Logic Handlers
  const handleBulkAction = async (ids: string[], nextStatus: string) => {
    const clearSelection = () => setSelectedOrders([]);

    if (nextStatus === "delete") {
      toast.info("Chức năng xóa hàng loạt đang được cập nhật");
      return;
    }

    switch (status) {
      case "pending":
        if (nextStatus === "confirmed") {
          onConfirmOrders(ids, clearSelection);
        } else if (nextStatus === "cancelled") {
          onCancelOrders(ids, clearSelection);
        }
        break;
      case "confirmed":
        if (nextStatus === "cancelled") {
          onCancelOrders(ids, clearSelection);
        } else if (nextStatus === "shipping") {
          onCreateExportTicket(ids, clearSelection);
        }
        break;
      case "shipping":
        if (nextStatus === "delivered") {
          if (ids.length === 1) {
            setOrderIdToReconcile(ids[0]);
          } else {
            onBulkReconcileOrders(ids, clearSelection);
          }
        } else if (nextStatus === "cancelled") {
          if (ids.length === 1) {
            const note = window.prompt(
              "Nhập lý do hủy giao hàng (tùy chọn):",
              "",
            );
            if (note !== null) {
              onCancelDeliveryOrder(ids[0], note, clearSelection);
            }
          } else {
            toast.info("Vui lòng xử lý hủy từng đơn hàng đang giao");
          }
        }
        break;
      case "delivered":
        if (nextStatus === "confirmed") {
          if (ids.length === 1) {
            onRollbackOrderDelivery(ids[0], clearSelection);
          } else {
            toast.info("Vui lòng hoàn tác từng đơn hàng lẻ");
          }
        }
        break;
      case "cancelled":
        if (nextStatus === "confirmed") {
          if (ids.length === 1) {
            onRollbackOrderDelivery(ids[0], clearSelection);
          } else {
            toast.info("Vui lòng hoàn tác từng đơn hàng lẻ");
          }
        }
        break;
      default:
        console.log(
          `Hành động ${nextStatus} cho status ${status} chưa được định nghĩa`,
        );
        break;
    }
  };

  const startItem =
    orders.length > 0
      ? ((data?.pagination?.currentPage || 1) - 1) * limit + 1
      : 0;
  const endItem = Math.min(
    (data?.pagination?.currentPage || 1) * limit,
    data?.pagination?.totalItems || 0,
  );

  return (
    <div className="flex flex-col h-full w-full flex-1 overflow-hidden bg-slate-50/30">
      <FilterBar
        onSearch={(val) => {
          updateParams({ search: val, page: "1" });
          setSelectedOrders([]);
        }}
        defaultValue={search}
        onAddNew={
          hasRole(["admin", "owner", "salers"])
            ? () => navigate("/orders/add")
            : undefined
        }
        filters={[
          {
            key: "route",
            placeholder: "Tất cả tuyến đường",
            options: routeOptions,
            value: routeId,
            onChange: (val) => {
              updateParams({ routeId: val, page: "1" });
              setSelectedOrders([]);
            },
          },
        ]}
      >
        <DatePickerWithRange
          date={dateRange}
          setDate={(range) => {
            updateParams({
              startDate: range?.from?.toISOString(),
              endDate: range?.to?.toISOString(),
              page: "1",
            });
            setSelectedOrders([]);
          }}
          className="z-20"
        />
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
            Hiển thị:
          </span>
          <Select
            value={String(limit)}
            onValueChange={(val) => updateParams({ limit: val, page: "1" })}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs transition-all shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="end"
              className="min-w-[70px]"
            >
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      <div className="px-4 py-3 border-b overflow-x-auto flex items-center gap-2 bg-white shrink-0 scrollbar-hide">
        {statusOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={status === opt.value ? "default" : "ghost"}
            size="sm"
            className={cn(
              "rounded-full px-4 h-8 text-xs font-medium transition-all",
              status !== opt.value && "text-slate-500 hover:bg-slate-100",
            )}
            onClick={() => {
              updateParams({ status: opt.value, page: "1" });
              setSelectedOrders([]);
            }}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col p-4 flex-1 overflow-hidden relative">
        <div className="flex flex-1 flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden z-50">
              <div className="h-full bg-primary animate-[loading_1.5s_infinite_linear] w-[40%]" />
            </div>
          )}

          <div className="flex-1 overflow-auto scrollbar-hide">
            {isLoading ? (
              <TableLoading />
            ) : isError ? (
              <TableError onRetry={refetch} />
            ) : (
              <TableData
                data={orders}
                columns={columns}
                onView={(row) =>
                  navigate(`/orders/${row.id}`, { state: { order: row } })
                }
                onUpdate={(row) =>
                  navigate(`/orders/${row.id}/edit`, { state: { order: row } })
                }
                onDelete={(row) => setOrderIdToDelete(row.id)}
                enableSelection
                selectedIds={selectedOrders}
                onSelectionChange={setSelectedOrders}
              />
            )}
          </div>

          <PageFooter className="bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Hiển thị</span>{" "}
              <span className="font-bold text-foreground">
                {startItem} - {endItem}
              </span>
              <span>trên</span>{" "}
              <span className="font-bold text-foreground">
                {data?.pagination?.totalItems || 0}
              </span>{" "}
              <span>kết quả</span>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => updateParams({ page: String(page - 1) })}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => updateParams({ page: String(page + 1) })}
                disabled={page >= (data?.pagination?.totalPages || 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </PageFooter>
        </div>
      </div>

      <AlertDialog
        open={!!orderIdToDelete}
        onOpenChange={(open) => !open && setOrderIdToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đơn hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderIdToDelete) {
                  onDeleteOrder(orderIdToDelete);
                  setOrderIdToDelete(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OrderBulkActions
        status={status}
        selectedIds={selectedOrders}
        onClear={() => setSelectedOrders([])}
        onAction={handleBulkAction}
        isPending={isOrderActionPending}
      />

      <ReconcileOrderDialog
        orderId={orderIdToReconcile}
        onClose={() => {
          setOrderIdToReconcile(null);
          setSelectedOrders([]);
        }}
      />
    </div>
  );
};
