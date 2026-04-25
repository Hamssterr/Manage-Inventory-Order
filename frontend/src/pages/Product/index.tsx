import { FilterBar, type FilterDefinition } from "@/components/filter-bar";
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
import { CATEGORY_OPTIONS } from "@/constants/category-value";
import { usePermission } from "@/hooks/usePermission";
import { deleteProductMutation, useGetProduct } from "@/hooks/useProduct";
import type { IProduct } from "@/types/product";
import { formatCurrency } from "@/utils/helper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const ProductPage = () => {
  const { hasRole } = usePermission();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const limit = 15;

  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);

  const { data, isLoading, isError, refetch, isPending } = useGetProduct({
    limit,
    page,
    search: search !== "" ? search : undefined,
    category: category !== "ALL" ? category : undefined,
  });

  const { mutate: deleteProduct, isPending: isDeleting } =
    deleteProductMutation();

  const products = useMemo(() => {
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

  const startItem = products.length > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem =
    products.length > 0 ? Math.min(currentPage * limit, totalItems) : 0;

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleCategoryChange = useCallback((val: string) => {
    setCategory(val);
    setPage(1);
  }, []);

  const handleAddNew = () => {
    navigate("/products/add");
  };

  const handleOnSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleConfirmDelete = () => {
    if (!productToDelete) return;

    deleteProduct(productToDelete._id, {
      onSuccess: () => {
        toast.success("Xóa sản phẩm thành công!");
        setProductToDelete(null);

        if (products.length === 1 && currentPage > 1) {
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

  const filters: FilterDefinition[] = useMemo(
    () => [
      {
        key: "category",
        placeholder: "Danh mục",
        options: CATEGORY_OPTIONS,
        value: category,
        onChange: handleCategoryChange,
      },
    ],
    [category, handleCategoryChange],
  );

  const columns: ColumnDef<IProduct & { id: string }>[] = [
    {
      header: "Mã SKU",
      accessorKey: "sku",
      className:
        "min-w-[100px] max-w-[110px] truncate font-medium text-blue-600",
    },
    {
      header: "Tên sản phẩm",
      accessorKey: "name",
      className: "min-w-[200px] max-w-[210px] truncate",
    },
    {
      header: "Chương trình",
      accessorKey: "category",
      className: "w-[180px]",
    },
    {
      header: "Hình thức bán",
      className: "w-[160px]",
      cell: (row) => (
        <div className="flex gap-1 flex-wrap justify-start">
          {row.units.map((u, index) => (
            <span
              key={u.unitName || index}
              className={`flex gap-1 items-center text-[10px] px-1.5 py-0.5 rounded border border-input leading-none ${u.isDefault ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/50"}`}
            >
              <p>{u.unitName}</p>
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Giá bán",
      className: "min-w-[160px] max-w-[200px]",
      cell: (row) => (
        <div className="flex flex-col gap-1.5 py-1">
          {row.units.map((unit, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[11px] transition-all
                ${
                  unit.isDefault
                    ? "bg-primary/5 border-primary/20 ring-1 ring-primary/5"
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                }`}
            >
              <span
                className="font-semibold text-muted-foreground uppercase tracking-tight truncate max-w-[70px]"
                title={unit.unitName}
              >
                {unit.unitName}
              </span>
              <span
                className={`font-bold tabular-nums whitespace-nowrap ${unit.isDefault ? "text-primary" : "text-slate-700"}`}
              >
                {formatCurrency(unit.priceDefault)}
                <span className="ml-0.5 text-[10px] font-normal opacity-70 italic">
                  đ
                </span>
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <FilterBar
        onSearch={handleOnSearch}
        onAddNew={
          hasRole(["admin", "owner"]) ? () => handleAddNew() : undefined
        }
        filters={filters}
      />

      <div className="flex flex-col p-2 h-screen">
        <div className="flex flex-1 flex-col bg-white rounded-xl border overflow-hidden relative">
          {isPending && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden z-50">
              <div className="h-full bg-primary animate-[loading_1.5s_infinite_linear] w-[40%]" />
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLoading ? (
              <TableLoading />
            ) : isError ? (
              <TableError onRetry={() => refetch()} />
            ) : (
              <TableData
                data={products}
                columns={columns}
                onView={(row) =>
                  navigate(`/products/${row.id}`, { state: { product: row } })
                }
                onUpdate={(row) =>
                  navigate(`/products/${row.id}/edit`, {
                    state: { product: row },
                  })
                }
                onDelete={(row) => setProductToDelete(row)}
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
        open={!!productToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setProductToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm này?
              {productToDelete && (
                <div className="text-sm">
                  <p className="font-bold text-base text-foreground mb-1">
                    {productToDelete.name}
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
              onClick={() => setProductToDelete(null)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa sản phẩm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
