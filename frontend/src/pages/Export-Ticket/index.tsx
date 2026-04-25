import { FilterBar } from "@/components/filter-bar";
import {
  useDeleteExportTicket,
  useGetAllExportTicket,
} from "@/hooks/useExportTicket";
import { useCallback, useMemo, useState } from "react";
import { ExportTicketColumn } from "./components/export-ticket-column";
import { TableError, TableLoading } from "@/components/table-loading";
import { TableData } from "@/components/table-data";
import { PageFooter } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useGetAllRouteQuery } from "@/hooks/useRoute";
import { DatePickerWithRange } from "@/components/date-range-picker";
import type { IExportTicket } from "@/types/export-ticket";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ExportTicketPage = () => {
  const navigate = useNavigate();

  // 1. Dùng Local State thay cho URL Params
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [routeId, setRouteId] = useState("");
  const [dateRange, setDateRange] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);
  const [limit] = useState(20);

  const [selectedDelete, setSelectedDelete] = useState<IExportTicket | null>(
    null,
  );

  const searchDebounce = useDebounce(search, 400);

  const { data: routesData } = useGetAllRouteQuery({ limit: 100 });
  const { mutateAsync: deleteExportTicket, isPending: isPendingDelete } =
    useDeleteExportTicket();

  // 2. Tích hợp State vào Query
  const {
    data: exportTicketData,
    isPending,
    isLoading,
    isError,
    refetch,
  } = useGetAllExportTicket({
    limit,
    page,
    search: searchDebounce !== "" ? searchDebounce : undefined,
    routeId: routeId !== "" ? routeId : undefined,
    startDate: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  });

  const data = useMemo(
    () =>
      exportTicketData?.data.map((item) => ({ ...item, id: item._id })) || [],
    [exportTicketData],
  );

  const column = useMemo(() => ExportTicketColumn(), []);

  const pagination = exportTicketData?.pagination;
  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.currentPage || 1;

  const startItem = data.length > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = (currentPage - 1) * limit + data.length;

  // 3. Các hàm xử lý đơn giản hơn
  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleView = useCallback(
    (row: IExportTicket) => {
      navigate(`/export-tickets/${row._id}`);
    },
    [navigate],
  );

  const handleConfirmDelete = () => {
    if (!selectedDelete) return;

    deleteExportTicket(selectedDelete._id, {
      onSuccess: () => {
        toast.success("Xóa phiếu xuất thành công!");
        setSelectedDelete(null);
        if (exportTicketData?.data.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          refetch();
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || "Xóa thất bại! Vui lòng thử lại.";
        toast.error(errorMessage);
      },
    });
  };

  const routeOptions = useMemo(
    () =>
      routesData?.data.map((r: any) => ({
        label: r.routeName,
        value: r._id,
      })) || [],
    [routesData],
  );

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden bg-slate-50/30">
      <FilterBar
        onSearch={handleSearch}
        defaultValue={search}
        filters={[
          {
            key: "routeId",
            placeholder: "Tất cả tuyến đường",
            options: routeOptions,
            value: routeId,
            onChange: (val) => {
              setRouteId(val);
              setPage(1);
            },
          },
        ]}
      >
        <DatePickerWithRange
          date={dateRange}
          setDate={(range: any) => {
            setDateRange(range);
            setPage(1);
          }}
          placeholder="Lọc theo ngày"
        />
      </FilterBar>

      <div className="p-4 flex flex-col flex-1 overflow-hidden relative">
        <div className="flex flex-1 flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
          {(isPending || isPendingDelete) && (
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
                data={data}
                columns={column}
                onView={handleView}
                onDelete={(row) => setSelectedDelete(row)}
              />
            )}
          </div>

          <PageFooter className="bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Hiển thị</span>
              <span className="font-bold text-foreground">
                {startItem} - {endItem}
              </span>
              <span>trên</span>
              <span className="font-bold text-foreground">{totalItems}</span>
              <span>kết quả</span>
            </div>

            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handlePrev}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleNext}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </PageFooter>
        </div>
      </div>

      <AlertDialog
        open={!!selectedDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isPendingDelete) setSelectedDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phiếu xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiếu xuất này?
              {selectedDelete && (
                <div className="text-sm">
                  <p className="font-bold text-base text-foreground mb-1">
                    {selectedDelete.ticketCode}
                  </p>
                  <p className="font-medium text-destructive text-xs">
                    * Hành động này không thể hoàn tác và có thể ảnh hưởng đến
                    dữ liệu liên quan.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedDelete(null)}
              disabled={isPendingDelete}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPendingDelete}
            >
              {isPendingDelete ? "Đang xóa..." : "Xóa phiếu xuất"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
