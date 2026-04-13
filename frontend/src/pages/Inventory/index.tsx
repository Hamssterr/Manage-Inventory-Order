import { FilterBar } from "@/components/filter-bar";
import { PageFooter } from "@/components/footer";
import { TableData, type ColumnDef } from "@/components/table-data";
import { TableError, TableLoading } from "@/components/table-loading";
import { Button } from "@/components/ui/button";
import { useGetInventoryProducts } from "@/hooks/useInventory";
import type { IProduct } from "@/types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const INVENTORY_CATEGORIES = [
  { label: "Gia vị", value: "Gia vị" },
  { label: "Bột giặt - Xà bông", value: "Bột giặt - Xà bông" },
  { label: "Nước giải khát", value: "Nước giải khát" },
];

export const InventoryPage = () => {
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, isError, refetch } = useGetInventoryProducts({
    limit,
    page,
  });

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
          {row.units.map((u) => (
            <span
              key={u._id}
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

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1); // Đổi danh mục thì cũng phải quay về trang 1
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <FilterBar
        onSearch={handleSearch}
        onAddNew={() => console.log("Mở modal tạo mã vật tư mới")}
        onCategoryChange={handleCategoryChange}
        categories={INVENTORY_CATEGORIES}
      />
      <div className="flex flex-col h-full bg-white rounded-xl border overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoading ? (
            <TableLoading />
          ) : isError ? (
            <TableError onRetry={() => refetch()} />
          ) : (
            <TableData
              data={products}
              columns={columns}
              onView={(row) => console.log(row)}
              onUpdate={(row) => console.log(row._id)}
              onDelete={(row) => console.log(row._id)}
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
  );
};
