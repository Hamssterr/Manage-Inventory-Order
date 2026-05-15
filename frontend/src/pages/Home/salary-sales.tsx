import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetSalerSalary } from "@/hooks/useReport";
import {
  Calendar,
  Loader2,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export const SalarySales = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const {
    data: salaryData,
    isLoading,
    isFetching,
  } = useGetSalerSalary({ month, year });

  return (
    <div className="flex flex-col h-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all hover:shadow-md overflow-hidden relative rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-50 gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 rounded-xl bg-orange-50 items-center justify-center text-orange-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Thống kê lương </h3>
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              Thống kê sản phẩm và hoa hồng
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
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 opacity-50" />
            <p className="text-sm text-slate-400 animate-pulse">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : !salaryData || salaryData.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Chưa có dữ liệu lương trong tháng này
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-slate-50 max-h-[520px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {salaryData.products.map((product, index) => (
                <div
                  key={product.productId + index}
                  className="flex items-center justify-between py-4 group hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-orange-500 transition-all border border-transparent group-hover:border-slate-100">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 line-clamp-1">
                        {product.productName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Đơn vị: {product.unitName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {product.totalQuantity}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase">
                        {product.unitName}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      +{product.totalSalary.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            <div className="mt-auto px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Tổng sản phẩm
                </span>
                <span className="text-lg font-black text-slate-800">
                  {salaryData.summary.totalProductsSold}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Tổng hoa hồng
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-600">
                  {salaryData.summary.totalSalary.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
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
