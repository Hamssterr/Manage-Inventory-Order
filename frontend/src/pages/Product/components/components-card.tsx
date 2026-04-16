import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import type { ComboFormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGetInventoryProducts } from "@/hooks/useInventory";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import type { IProduct } from "@/types/product";
import { useDebounce } from "@/hooks/useDebounce";

// ---------------------------------------------------------
// Component Tối Ưu: ProductSearchSelect
// ---------------------------------------------------------
const ProductSearchSelect = ({
  value,
  onChange,
  error,
  initialProductInfo,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  initialProductInfo?: { name: string; sku: string; baseUnit: string };
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tối ưu 1: State giữ cứng tên hiển thị, tránh bị mất khi API refetch
  const [displayLabel, setDisplayLabel] = useState<string>(
    initialProductInfo
      ? `[${initialProductInfo.sku}] ${initialProductInfo.name} (${initialProductInfo.baseUnit})`
      : "Tìm kiếm sản phẩm...",
  );

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tối ưu 2: CHỈ GỌI API KHI DROPDOWN MỞ (Tiết kiệm tài nguyên khổng lồ)
  // Lưu ý: Bạn cần đảm bảo custom hook useGetInventoryProducts hỗ trợ truyền cấu hình của React Query vào (ví dụ: { enabled: isOpen })
  const { data: inventoryData, isLoading } = useGetInventoryProducts(
    { limit: 20, search: debouncedSearch !== "" ? debouncedSearch : undefined },
    { enabled: isOpen }, // <--- Cực kỳ quan trọng
  );

  const productOptions = inventoryData?.data || [];

  const handleSelect = (opt: IProduct) => {
    onChange(opt._id); // Gửi ID lên Form
    setDisplayLabel(`[${opt.sku}] ${opt.name} (${opt.baseUnit})`); // Cập nhật nhãn
    setIsOpen(false); // Đóng menu
    setSearch(""); // Reset search
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border ${
          error ? "border-red-500" : "border-input"
        } bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-left truncate`}
      >
        <span className="truncate text-foreground">{displayLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-[200px] mt-1 overflow-hidden bg-white border rounded-md shadow-lg">
          <div className="flex items-center gap-2 p-2 px-3 border-b border-gray-100 bg-slate-50">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              className="w-full text-sm outline-none bg-transparent"
              placeholder="Nhập mã, tên SP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            />
            {isLoading && (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>

          <div className="max-h-[220px] overflow-auto p-1">
            {productOptions.length === 0 && !isLoading ? (
              <p className="px-2 py-4 text-sm text-center text-muted-foreground">
                Không tìm thấy kết quả.
              </p>
            ) : (
              productOptions.map((opt) => (
                <div
                  key={opt._id}
                  onClick={() => handleSelect(opt)}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 px-2 text-sm outline-none hover:bg-slate-100 hover:text-accent-foreground transition-colors ${
                    value === opt._id
                      ? "bg-primary/10 text-primary font-medium"
                      : ""
                  }`}
                >
                  <span className="truncate">
                    <span className="font-semibold mr-1">[{opt.sku}]</span>
                    {opt.name} ({opt.baseUnit})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------
// Component Chính: ComponentsCard
// ---------------------------------------------------------
export const ComponentsCard = () => {
  const location = useLocation();
  const originProduct = location?.state?.product as IProduct | undefined;

  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ComboFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "components",
  });

  return (
    <div className="border rounded shadow-sm bg-white">
      {/* HEADER TƯƠNG TỰ */}
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-t">
        <div>
          <p className="font-bold text-md">Sản phẩm thành phần</p>
          <p className="text-muted-foreground text-xs">
            Cấu hình các sản phẩm vật lý thuộc combo này
          </p>
        </div>
        <Button
          onClick={() => append({ productId: "", quantityPerBaseUnit: 1 })}
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground px-1 uppercase">
          <div className="col-span-8">
            Sản phẩm kho <span className="text-red-500">*</span>
          </div>
          <div className="col-span-3">
            Số lượng <span className="text-red-500">*</span>
          </div>
          <div className="col-span-1 text-center">Xóa</div>
        </div>

        {/* LIST RENDER */}
        {fields.map((field, index) => {
          // Tính toán initial data 1 lần duy nhất để đẩy xuống
          const originComponent = originProduct?.components?.[index];
          let initialProductInfo:
            | { name: string; sku: string; baseUnit: string }
            | undefined;

          if (
            originComponent &&
            typeof originComponent.productId === "object"
          ) {
            const p = originComponent.productId as any;
            initialProductInfo = {
              name: p.name,
              sku: p.sku,
              baseUnit: p.baseUnit || "",
            };
          }

          return (
            <div key={field.id} className="grid grid-cols-12 items-start gap-3">
              {/* CỘT SEARCH SẢN PHẨM */}
              <div className="col-span-8">
                <Controller
                  control={control}
                  name={`components.${index}.productId`}
                  render={({ field }) => (
                    <ProductSearchSelect
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.components?.[index]?.productId}
                      initialProductInfo={initialProductInfo}
                    />
                  )}
                />
                {errors.components?.[index]?.productId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.components[index].productId?.message}
                  </p>
                )}
              </div>

              {/* CỘT SỐ LƯỢNG */}
              <div className="col-span-3">
                <Input
                  type="number"
                  min={1}
                  {...register(`components.${index}.quantityPerBaseUnit`, {
                    valueAsNumber: true,
                  })}
                  className={
                    errors.components?.[index]?.quantityPerBaseUnit
                      ? "border-red-500"
                      : ""
                  }
                />
                {errors.components?.[index]?.quantityPerBaseUnit && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.components[index].quantityPerBaseUnit?.message}
                  </p>
                )}
              </div>

              {/* CỘT XOÁ */}
              <div className="col-span-1 flex justify-center mt-0.5">
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
