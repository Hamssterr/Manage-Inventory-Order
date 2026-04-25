import { useFormContext, useWatch } from "react-hook-form";
import type { CreateOrderFormValues } from "../../schema";
import { useGetSalersQuery } from "@/hooks/useUser";
import { UserCircle, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useMemo, useRef, useState } from "react";

export const SaleSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: saleDataRaw, isLoading } = useGetSalersQuery();
  const allSalers = (saleDataRaw as any) || [];

  const filteredSalers = useMemo(() => {
    if (!debouncedSearch) return allSalers;
    return allSalers.filter((s: any) =>
      s.displayName.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );
  }, [allSalers, debouncedSearch]);

  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrderFormValues>();

  const selectedSale = useWatch({ control, name: "saleId" });
  const fallbackSaleName = useWatch({ control, name: "saleNameSnapshot" });

  const displayNameLabel = useMemo(() => {
    if (!selectedSale || !allSalers) {
      return fallbackSaleName || "";
    }
    const sale = allSalers.find((s: any) => s._id === selectedSale);
    return sale ? sale.displayName : fallbackSaleName || "";
  }, [selectedSale, allSalers, fallbackSaleName]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue(displayNameLabel);
      setSearch("");
    }
  }, [isOpen, displayNameLabel]);

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

  const handleSelectSale = (sale: any) => {
    setValue("saleId", sale._id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setValue("saleId", "", { shouldValidate: true });
    setInputValue("");
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div
      className="p-4 bg-slate-50 border border-slate-100 rounded-xl relative"
      ref={wrapperRef}
    >
      <div className="flex items-center gap-2 mb-3">
        <UserCircle className="w-4 h-4 text-slate-500" />
        <label className="text-sm font-semibold text-slate-700">
          Nhân viên phụ trách <span className="text-red-500">*</span>
        </label>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none"></div>
        <Input
          value={inputValue}
          placeholder="Chọn nhân viên phụ trách"
          onChange={(e) => {
            setInputValue(e.target.value);
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "w-full h-10 bg-white shadow-sm transition-all duration-200 text-sm",
            errors.saleId
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-200 focus-visible:ring-blue-500",
            isOpen && "ring-2 ring-blue-100 border-blue-400",
          )}
        />

        {selectedSale && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-500 transition-colors z-10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 max-h-[320px] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200 [scrollbar-width:auto] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="p-2">
              {isLoading ? (
                <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                  <span className="text-sm">Đang tìm kiếm...</span>
                </div>
              ) : filteredSalers.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filteredSalers.map((sale: any) => {
                    const isSelected = selectedSale === sale._id;
                    return (
                      <div
                        key={sale._id}
                        onClick={() => handleSelectSale(sale)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                          isSelected
                            ? "bg-blue-50 border border-blue-100"
                            : "hover:bg-slate-50 border border-transparent",
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm  truncate",
                              isSelected ? "text-blue-700" : "text-slate-700",
                            )}
                          >
                            {sale.displayName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                    <Search className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 mt-2">
                    Không tìm thấy nhân viên
                  </p>
                  <p className="text-xs text-slate-400">
                    Vui lòng thử lại với từ khóa khác
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {errors.saleId && (
        <p className="text-red-500 text-[13px] mt-1.5 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>
          {errors.saleId.message}
        </p>
      )}
    </div>
  );
};
