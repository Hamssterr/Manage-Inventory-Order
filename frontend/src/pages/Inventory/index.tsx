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
import {
  useDeleteInventoryProduct,
  useGetInventoryProducts,
} from "@/hooks/useInventory";
import { usePermission } from "@/hooks/usePermission";
import type { IProduct } from "@/types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const InventoryPage = () => {
  const { hasRole } = usePermission();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const limit = 20;

  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);

  const { data, isLoading, isError, refetch, isPending } =
    useGetInventoryProducts({
      limit,
      page,
      search: search !== "" ? search : undefined,
      category: category !== "ALL" ? category : undefined,
    });

  const { mutate: deleteProduct, isPending: isDeleting } =
    useDeleteInventoryProduct();

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

  // Calculate range labels
  const startItem = products.length > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = (currentPage - 1) * limit + products.length;

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  const handleAddNew = () => {
    navigate("/inventory/add");
  };

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((val: string) => {
    setCategory(val);
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
      className: "w-[120px] font-medium text-blue-600",
    },
    {
      header: "Tên sản phẩm",
      accessorKey: "name",
      className: "w-[250px]",
    },
    {
      header: "Danh mục",
      accessorKey: "category",
      className: "w-[200px]",
    },
    {
      header: "Đơn vị tính",
      accessorKey: "baseUnit",
      className: "w-[200px]",
    },
    {
      header: "Đơn vị bán",
      className: "w-[200px]",
      cell: (row) => (
        <div className="flex gap-1 flex-wrap">
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
      header: "Tồn kho",
      accessorKey: "displayQuantity",
      className: "w-[100px] text-center font-semibold",
    },
  ];

  return (
    <div className="flex flex-col h-full w-full flex-1 overflow-hidden bg-slate-50/30">
      <FilterBar
        onSearch={handleSearch}
        onAddNew={
          hasRole(["admin", "owner"]) ? () => handleAddNew() : undefined
        }
        filters={filters}
      />
      <div className="flex flex-col p-4 flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col bg-white rounded-xl border-slate-200 border shadow-sm overflow-hidden relative">
          {isPending && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden z-50">
              <div className="h-full bg-primary animate-[loading_1.5s_infinite_linear] w-[40%]" />
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
            {isLoading ? (
              <TableLoading />
            ) : isError ? (
              <TableError onRetry={() => refetch()} />
            ) : (
              <TableData
                data={products}
                columns={columns}
                onView={(row) =>
                  navigate(`/inventory/${row._id}`, { state: { product: row } })
                }
                onUpdate={(row) =>
                  navigate(`/inventory/${row._id}/edit`, {
                    state: { product: row },
                  })
                }
                onImport={(row) =>
                  navigate(`/inventory/${row._id}/import`, {
                    state: { product: row },
                  })
                }
                onDelete={(row) => setProductToDelete(row)}
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
