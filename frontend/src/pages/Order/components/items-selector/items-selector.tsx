import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetProduct } from "@/hooks/useProduct";
import type { IProduct } from "@/types/product";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { CreateOrderFormValues } from "../../schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/helper";
import { Button } from "@/components/ui/button";

interface ItemsSelectorProps {
  index: number;
  onRemove: () => void;
}

export const ItemsSelector = ({ index, onRemove }: ItemsSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrderFormValues>();

  const { data: productData, isLoading } = useGetProduct({
    page: 1,
    limit: 10,
    search: debouncedSearch !== "" ? debouncedSearch : undefined,
  });
  const products = productData?.data || [];

  const selectedProductId = useWatch({
    control,
    name: `items.${index}.productId`,
  });

  const fallbackProductName = useWatch({
    control,
    name: `items.${index}.productNameSnapshot`,
  });

  const fallbackPrice = useWatch({
    control,
    name: `items.${index}.price`,
  });

  const unitName = useWatch({
    control,
    name: `items.${index}.unitName`,
  });

  const quantity = useWatch({
    control,
    name: `items.${index}.quantity`,
  });

  const selectedProduct = useMemo(() => {
    return products.find((p) => p._id === selectedProductId);
  }, [selectedProductId, products]);

  // Tìm đơn giá dựa trên đơn vị đã chọn
  const unitPrice = useMemo(() => {
    if (selectedProduct && unitName) {
      const unit = selectedProduct.units?.find((u) => u.unitName === unitName);
      return unit ? unit.priceDefault : 0;
    }
    return fallbackPrice || 0;
  }, [selectedProduct, unitName, fallbackPrice]);

  const totalAmount = useMemo(() => {
    return (quantity || 0) * unitPrice;
  }, [quantity, unitPrice]);

  // Cập nhật giá vào form state để OrderSummaryCard có thể tính toán
  useEffect(() => {
    if (unitPrice !== undefined) {
      setValue(`items.${index}.price`, unitPrice);
    }
  }, [unitPrice, setValue, index]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue(selectedProduct?.name || fallbackProductName || "");
      setSearch("");
    }
  }, [isOpen, selectedProduct, fallbackProductName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: IProduct) => {
    setValue(`items.${index}.productId`, product._id, { shouldValidate: true });
    setValue(`items.${index}.unitName`, ""); // QUAN TRỌNG: Đổi SP phải reset ĐVT
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(`items.${index}.productId`, "", { shouldValidate: true });
    setValue(`items.${index}.unitName`, "", { shouldValidate: true });
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col md:grid md:grid-cols-12 gap-3 md:items-center py-4 md:py-2.5 border-b border-slate-100 last:border-0 relative hover:bg-slate-50/50 transition-all px-2 md:px-2 group/row",
        isOpen ? "z-50" : "z-0",
      )}
    >
      {/* Tên sản phẩm */}
      <div className="md:col-span-4 relative pr-8 md:pr-0" ref={wrapperRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within/row:text-blue-500 transition-colors" />
          </div>
          <Input
            value={inputValue}
            placeholder="Tìm tên sản phẩm..."
            onChange={(e) => {
              setInputValue(e.target.value);
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "w-full pl-9 h-9 bg-white border-slate-200 shadow-sm text-sm transition-all focus:ring-1 focus:ring-blue-100",
              errors.items?.[index]?.productId &&
                "border-red-500 focus:ring-red-50 focus:border-red-500",
            )}
          />

          {selectedProduct && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-500 transition-colors z-10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-68 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {isLoading ? (
              <div className="p-6 text-[13px] text-blue-600 text-center animate-pulse flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : products.length === 0 ? (
              <div className="p-6 text-[13px] text-slate-400 text-center italic">
                Không tìm thấy sản phẩm nào
              </div>
            ) : (
              <div className="p-1.5">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all text-[13.5px]",
                      selectedProductId === product._id
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-slate-50 text-slate-600",
                    )}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 opacity-70" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="truncate">{product.name}</span>
                      {product.sku && (
                        <span className="text-[11px] opacity-60 leading-none mt-0.5">
                          {product.sku}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {errors.items?.[index]?.productId && (
          <p className="text-red-500 text-[11px] mt-1 absolute -bottom-4 left-0">
            {errors.items[index]?.productId?.message}
          </p>
        )}
      </div>

      <div className="flex gap-3 w-full md:contents">
        {/* Đơn vị tính */}
        <div className="flex-1 md:col-span-2">
          <Controller
            control={control}
            name={`items.${index}.unitName`}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger
                  className={cn(
                    "h-9 bg-white border-slate-200 text-sm shadow-sm",
                    errors.items?.[index]?.unitName && "border-red-500",
                  )}
                  disabled={!selectedProduct}
                >
                  <SelectValue placeholder="Chọn ĐVT" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="rounded-xl border-slate-200 "
                >
                  {!selectedProduct ? (
                    <div className="p-4 text-[12px] text-slate-400 text-center italic font-medium">
                      Chọn sản phẩm trước
                    </div>
                  ) : selectedProduct.units?.length === 0 ? (
                    <div className="p-4 text-[12px] text-slate-400 text-center italic">
                      Chưa thiết lập ĐVT
                    </div>
                  ) : (
                    selectedProduct.units?.map((unit, i) => (
                      <SelectItem
                        key={i}
                        value={unit.unitName}
                        className="text-[13px] py-2.5 "
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{unit.unitName}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Số lượng */}
        <div className="w-[100px] md:w-auto md:col-span-1">
          <Controller
            control={control}
            name={`items.${index}.quantity`}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    field.onChange("");
                    return;
                  }
                  field.onChange(Number(val));
                }}
                className={cn(
                  "h-9 text-center bg-white border-slate-200 text-sm font-medium shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  errors.items?.[index]?.quantity && "border-red-500",
                )}
              />
            )}
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 md:bg-transparent p-2 md:p-0 rounded-lg md:contents mt-1 md:mt-0">
        {/* Đơn giá (Read-only text) */}
        <div className="md:col-span-2 md:text-right px-2 md:px-0">
          <span className="md:hidden text-xs text-slate-500 mr-2">
            Đơn giá:
          </span>
          <span className="text-[14px] text-slate-500 tabular-nums">
            {unitPrice ? `${formatCurrency(unitPrice)}đ` : "---"}
          </span>
        </div>

        {/* Thành tiền (Read-only text) */}
        <div className="md:col-span-2 md:text-right md:pr-4">
          <span className="md:hidden text-xs font-bold text-slate-700 mr-2">
            Thành tiền:
          </span>
          <span className="text-[14.5px] font-bold text-blue-600 tabular-nums">
            {totalAmount ? `${formatCurrency(totalAmount)}đ` : "0đ"}
          </span>
        </div>
      </div>

      {/* Nút xóa */}
      <div className="absolute top-4 right-2 md:static md:col-span-1 flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg opacity-100 md:opacity-0 md:group-hover/row:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
