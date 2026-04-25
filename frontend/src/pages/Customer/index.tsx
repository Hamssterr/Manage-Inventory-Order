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
import {
  deleteCustomerMutation,
  useGetAllCustomerQuery,
} from "@/hooks/useCustomer";
import type { ICustomer, ISaleRepMini } from "@/types/customer";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const CustomerPage = () => {
  const { hasRole } = usePermission();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 15;

  const [customerToDelete, setCustomerToDelete] = useState<ICustomer | null>(
    null,
  );

  const { data, isLoading, isError, refetch } = useGetAllCustomerQuery({
    limit,
    page,
    search: search !== "" ? search : undefined,
  });

  const { mutate: deleteCustomer, isPending: isDeleting } =
    deleteCustomerMutation();

  const customers = useMemo(() => {
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

  const startItem = customers.length > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem =
    customers.length > 0 ? Math.min(currentPage * limit, totalItems) : 0;

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleAddNew = () => {
    navigate("/customers/add");
  };

  const handleOnSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;

    deleteCustomer(customerToDelete._id, {
      onSuccess: () => {
        toast.success("Xóa khách hàng thành công!");
        setCustomerToDelete(null);

        if (customers.length === 1 && currentPage > 1) {
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

  const columns: ColumnDef<ICustomer & { id: string }>[] = [
    {
      header: "Khách hàng",
      className: "w-[200px] font-bold",
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground line-clamp-1">
              {row.name}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              MST: {row.taxCode !== "NOT_PROVIDED" ? row.taxCode : "Không có"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Số điện thoại",
      accessorKey: "phoneNumber",
      className: "w-[150px] font-bold",
    },

    {
      header: "Khu vực / Tuyến",
      className: "w-[200px]",
      cell: (row) => {
        const addr = row.addresses;
        if (!addr) return <span className="text-slate-400">Chưa cập nhật</span>;

        const routeName =
          typeof addr.routeId === "object"
            ? addr.routeId.routeName
            : "Chưa phân tuyến";

        return (
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">{routeName}</span>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {addr.district}, {addr.province}
            </span>
          </div>
        );
      },
    },
    {
      header: "Nhân viên phụ trách",
      className: "w-[200px]",
      cell: (row) => {
        const reps = Array.isArray(row.saleReps) ? row.saleReps : [];
        if (reps.length === 0)
          return <span className="text-slate-400">---</span>;

        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">
              {typeof reps[0] === "object"
                ? (reps[0] as ISaleRepMini).displayName
                : "Đang tải..."}
            </span>
            {reps.length > 1 && (
              <span className="text-[10px] text-muted-foreground italic">
                và {reps.length - 1} người khác
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Địa chỉ",
      accessorKey: "addresses",
      className: "w-[200px]",
      cell: (row) => {
        const addr = row.addresses;
        if (!addr) return <span className="text-slate-400">Chưa cập nhật</span>;
        return (
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">
              {addr.addressDetail} {addr.district}, {addr.province}
            </span>
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
          hasRole(["admin", "owner", "salers"])
            ? () => handleAddNew()
            : undefined
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
                data={customers}
                columns={columns}
                onView={(row) =>
                  navigate(`/customers/${row.id}`, {
                    state: { customer: row },
                  })
                }
                onUpdate={(row) =>
                  navigate(`/customers/${row.id}/edit`, {
                    state: { customer: row },
                  })
                }
                onDelete={
                  hasRole(["admin", "owner"])
                    ? (row) => setCustomerToDelete(row)
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
        open={!!customerToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setCustomerToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng này?
              {customerToDelete && (
                <div className="text-sm">
                  <p className="font-bold text-base text-foreground mb-1">
                    {customerToDelete.name}
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
              onClick={() => setCustomerToDelete(null)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa khách hàng"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
