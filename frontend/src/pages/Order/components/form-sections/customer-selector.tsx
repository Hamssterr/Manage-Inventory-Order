import { useGetInfiniteCustomerQuery } from "@/hooks/useCustomer";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { CreateOrderFormValues } from "../../schema";
import type { ICustomer } from "@/types/customer";
import { Input } from "@/components/ui/input";
import { Search, MapPin, UserCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const CustomerSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: customerData, isLoading } = useGetInfiniteCustomerQuery(
    {
      limit: 10,
      search: debouncedSearch !== "" ? debouncedSearch : undefined,
    },
    {
      enabled:
        isOpen && (debouncedSearch.length >= 3 || debouncedSearch === ""),
    },
  );

  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrderFormValues>();

  const selectedCustomer = useWatch({ control, name: "customerId" });
  const fallbackCustomerName = useWatch({
    control,
    name: "customerNameSnapshot",
  });

  const displayNameLabel = useMemo(() => {
    if (!selectedCustomer || !customerData) {
      return fallbackCustomerName || "";
    }

    const allCustomers =
      customerData.pages?.flatMap((page) => page.data || []) || [];
    const customer = allCustomers.find((c) => c._id === selectedCustomer);

    return customer
      ? `${customer.name} - ${customer.phoneNumber}`
      : fallbackCustomerName || "";
  }, [selectedCustomer, customerData, fallbackCustomerName]);

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

  const handleSelectCustomer = (customer: ICustomer) => {
    setValue("customerId", customer._id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue("customerId", "", { shouldValidate: true });
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
          Khách hàng <span className="text-red-500">*</span>
        </label>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none"></div>
        <Input
          value={inputValue}
          placeholder="Chọn khách hàng"
          onChange={(e) => {
            setInputValue(e.target.value);
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "w-full  h-10 bg-white shadow-sm transition-all duration-200 text-sm",
            errors.customerId
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-200 focus-visible:ring-blue-500",
            isOpen && "ring-2 ring-blue-100 border-blue-400",
          )}
        />

        {selectedCustomer && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-500 transition-colors z-10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {errors.customerId && (
        <p className="text-red-500 text-[13px] mt-1.5 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block"></span>
          {errors.customerId.message}
        </p>
      )}

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 max-h-[320px] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200 [scrollbar-width:auto] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="p-2">
            {debouncedSearch.length > 0 && debouncedSearch.length < 3 ? (
              <div className="lg:hidden! p-4 text-sm text-slate-500 text-center flex items-center justify-center gap-2 bg-slate-50 rounded-lg">
                <Search className="w-4 h-4 " />
                Nhập thêm {3 - debouncedSearch.length} ký tự để tìm kiếm...
              </div>
            ) : isLoading ? (
              <div className="p-8 text-sm text-blue-600 text-center flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-medium animate-pulse">
                  Đang tìm kiếm khách hàng...
                </span>
              </div>
            ) : (
              <>
                {customerData?.pages?.flatMap((page) => page.data || [])
                  .length === 0 ? (
                  <div className="p-8 text-sm text-slate-500 text-center flex flex-col items-center gap-2">
                    <UserCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>Không tìm thấy khách hàng cho "{debouncedSearch}"</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {customerData?.pages
                      ?.flatMap((page) => page.data || [])
                      .map((customer) => {
                        const isSelected = selectedCustomer === customer._id;
                        return (
                          <div
                            key={customer._id}
                            className={cn(
                              "relative flex flex-col p-2.5 rounded-lg cursor-pointer transition-all duration-200 border border-transparent",
                              isSelected
                                ? "bg-blue-50 border-blue-100 shadow-sm"
                                : "hover:bg-slate-50 hover:border-slate-100",
                            )}
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span
                                className={cn(
                                  "text-[14px] font-medium",
                                  isSelected
                                    ? "text-blue-700"
                                    : "text-slate-700",
                                )}
                              >
                                {customer.name}
                              </span>
                              <span
                                className={cn(
                                  "text-[11px] font-mono px-1.5 py-0.5 rounded-full",
                                  isSelected
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-500",
                                )}
                              >
                                {customer.phoneNumber}
                              </span>
                            </div>
                            <div className="flex items-start gap-1 text-slate-400 mt-0.5">
                              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                              <span className="text-[12px] leading-tight line-clamp-1">
                                {customer.addresses?.addressDetail},{" "}
                                {customer.addresses?.ward},{" "}
                                {customer.addresses?.district},{" "}
                                {customer.addresses?.province}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
