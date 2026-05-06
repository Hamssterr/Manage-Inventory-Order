import { useGetSalerSellingProductsQuery } from "@/hooks/useReport";
import { formatCurrency } from "@/utils/helper";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const SalerSellingProducts = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);

  const {
    data: products,
    isLoading,
    isFetching,
  } = useGetSalerSellingProductsQuery(month, year);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-col h-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all hover:shadow-md overflow-hidden relative rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-50 gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 rounded-xl bg-orange-50 items-center justify-center text-orange-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Sản phẩm bán chạy</h3>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Thống kê doanh số cá nhân
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={month.toString()}
            onValueChange={(v) => setMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[120px] h-9 border-slate-200 text-xs">
              <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="top"
              sideOffset={8}
              align="end"
              className="max-h-[280px] min-w-[120px] rounded-xl border-slate-100 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
            >
              {months.map((m) => (
                <SelectItem
                  key={m}
                  value={m.toString()}
                  className="text-xs rounded-lg py-2 focus:bg-orange-50 focus:text-orange-600 transition-colors"
                >
                  Tháng {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year.toString()}
            onValueChange={(v) => setYear(parseInt(v))}
          >
            <SelectTrigger className="w-[120px] h-9 border-slate-200 text-xs">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="top"
              sideOffset={8}
              align="end"
              avoidCollisions={false}
              className="max-h-[280px] min-w-[120px] rounded-xl border-slate-100 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95"
            >
              {years.map((y) => (
                <SelectItem
                  key={y}
                  value={y.toString()}
                  className="text-xs rounded-lg py-2 focus:bg-orange-50 focus:text-orange-600 transition-colors"
                >
                  Năm {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 opacity-50" />
            <p className="text-sm text-slate-400 animate-pulse">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Chưa có dữ liệu bán hàng trong tháng này
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="group flex items-center justify-between p-4 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-orange-100 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-110",
                        index === 0
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                          : index === 1
                            ? "bg-slate-700 text-white shadow-lg shadow-slate-200"
                            : index === 2
                              ? "bg-amber-600 text-white shadow-lg shadow-amber-200"
                              : "bg-white border border-slate-100 text-slate-400",
                      )}
                    >
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                      {product.productName}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                        {product.sku}
                      </span>
                      <span className="text-[12px] text-slate-400 font-medium">
                        {product.orderCount} đơn hàng
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">
                      Số lượng:
                    </span>
                    <span className="font-bold text-slate-700">
                      {product.totalQuantity}
                    </span>
                  </div>
                  <div className="text-sm font-black text-orange-600">
                    {formatCurrency(product.totalRevenue)}đ
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar (isFetching) */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-100 overflow-hidden z-10">
          <div
            className="h-full bg-orange-500 animate-[loading_1.5s_infinite_linear]"
            style={{ width: "30%" }}
          />
        </div>
      )}
    </div>
  );
};
