import { FilterBar } from "@/components/filter-bar";
import { PageFooter } from "@/components/footer";
import { TableData, type ColumnDef } from "@/components/table-data";
import { TableError, TableLoading } from "@/components/table-loading";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { deleteRouteMutation, useGetAllRouteQuery } from "@/hooks/useRoute";
import type { IRoute, IRouteSaleRep } from "@/types/route";
import { formatDateTime } from "@/utils/helper";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const RoutePage = () => {
  const { hasRole } = usePermission();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 15;

  const [routeToDelete, setRouteToDelete] = useState<IRoute | null>(null);

  const { data, isLoading, isError, refetch } = useGetAllRouteQuery({
    limit,
    page,
    search: search !== "" ? search : undefined,
  });

  const { mutate: deleteRoute, isPending: isDeleting } = deleteRouteMutation();

  const routes = useMemo(() => {
    return (
      data?.data.map((item) => ({
        ...item,
        id: item._id,
      })) || []
    );
  }, [data]);

  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 0;
  const currentPage = pagination?.currentPage || 1;

  const startItem = routes.length > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem =
    routes.length > 0 ? Math.min(currentPage * limit, totalItems) : 0;

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleAddNew = () => {
    navigate("/routes/add");
  };

  const handleOnSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleConfirmDelete = () => {
    if (!routeToDelete) return;

    deleteRoute(routeToDelete._id, {
      onSuccess: () => {
        toast.success("Xóa tuyến hàng thành công!");
        setRouteToDelete(null);

        if (routes.length === 1 && currentPage > 1) {
          setPage(currentPage - 1);
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || "Xóa thất bại! Vui lòng thử lại.";
        toast.error(errorMessage);
      },
    });
  };

  const columns: ColumnDef<IRoute & { id: string }>[] = [
    {
      header: "Tuyến đường",
      // Tăng nhẹ chiều rộng và bỏ fixed width nếu cần để nó linh hoạt
      className: "w-[300px] pl-4",
      cell: (row) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-orange-100/50 flex items-center justify-center shrink-0 border border-orange-200">
            <Map className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 truncate">
              {row.routeName}
            </span>
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
              Mã: {row.id.slice(-6)}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Mô tả",
      accessorKey: "description",
      // Chế độ xem mô tả nên để căn trái (Left) sẽ dễ đọc hơn căn giữa
      className: "w-[400px] text-left px-4",
      cell: (row) => (
        <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
          {row.description || (
            <span className="text-slate-300 italic">Không có mô tả</span>
          )}
        </p>
      ),
    },
    {
      header: "Ngày khởi tạo",
      className: "w-[200px] text-center",
      cell: (row) => {
        if (!row.createdAt) return <span className="text-slate-400">---</span>;
        // Chia làm 2 dòng để tiết kiệm chiều ngang và trông gọn hơn
        const date = new Date(row.createdAt);
        return (
          <div className="flex flex-col items-center">
            <span className="text-sm text-slate-700 font-medium">
              {formatDateTime(date)}
            </span>
          </div>
        );
      },
    },
    {
      header: "Nhân viên phụ trách",
      // Căn phải nhưng thêm padding-right đủ lớn để không dính lề
      className: "text-right pr-8 min-w-[200px]",
      cell: (row) => {
        const reps = Array.isArray(row.responsibleSale)
          ? (row.responsibleSale as IRouteSaleRep[])
          : [];

        if (reps.length === 0)
          return <span className="text-slate-400 pr-4">Chưa chỉ định</span>;

        return (
          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap justify-end gap-1 max-w-[250px]">
              {reps.map((rep) => (
                <span
                  key={rep._id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100"
                >
                  {rep.displayName}
                </span>
              ))}
            </div>
            {reps.length === 1 && (
              <span className="text-[10px] text-slate-400 font-mono">
                {reps[0].phoneNumber}
              </span>
            )}
            {reps.length > 1 && (
              <span className="text-[10px] text-slate-400 italic">
                {reps.length} nhân sự
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <FilterBar
        onSearch={handleOnSearch}
        onAddNew={
          hasRole(["admin", "owner"]) ? () => handleAddNew() : undefined
        }
        filters={[]}
      />

      <div className="flex flex-col p-2 h-screen">
        <div className="flex flex-1 flex-col bg-white rounded-xl border overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading ? (
              <TableLoading />
            ) : isError ? (
              <TableError onRetry={() => refetch()} />
            ) : (
              <TableData
                data={routes}
                columns={columns}
                onView={(row) =>
                  navigate(`/routes/${row.id}`, {
                    state: { route: row },
                  })
                }
                onUpdate={(row) =>
                  navigate(`/routes/${row.id}/edit`, {
                    state: { route: row },
                  })
                }
                onDelete={
                  hasRole(["admin", "owner"])
                    ? (row) => setRouteToDelete(row)
                    : undefined
                }
              />
            )}
          </div>

          <PageFooter>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Hiển thị</span>
              <span className="font-medium text-foreground">
                {startItem} - {endItem}
              </span>
              <span>trên</span>
              <span className="font-medium text-foreground">{totalItems}</span>
              <span>kết quả</span>
            </div>

            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={handlePrev}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
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
        open={!!routeToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setRouteToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tuyến đường</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tuyến đường này?
              {routeToDelete && (
                <div className="text-sm">
                  <p className="font-bold text-base text-foreground mb-1">
                    {routeToDelete.routeName}
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
              onClick={() => setRouteToDelete(null)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa tuyến"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
