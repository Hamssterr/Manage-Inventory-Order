import type { ChartFilter } from "@/types/report";
import { ChartHeader } from "./components/chart/chart-header";
import { SalerRevenueChart } from "./components/chart/saler-revenue-chart";
import { memo, useCallback, useEffect, useState } from "react";
import { useGetSalerRevenueDataQuery } from "@/hooks/useReport";
import { useGetSalersQuery } from "@/hooks/useUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const RevenueSalesBarChart = memo(() => {
  const [filter, setFilter] = useState<ChartFilter>("Tuần");
  const [selectedSaleId, setSelectedSaleId] = useState<string>("");
  const filterOptions: ChartFilter[] = ["Tuần", "Tháng", "Năm"];

  const handleSelectFilter = useCallback((f: string) => {
    setFilter(f as ChartFilter);
  }, []);

  const handleSelectSale = useCallback((id: string) => {
    setSelectedSaleId(id);
  }, []);

  const { data: salers, isLoading: isSalersLoading } = useGetSalersQuery();

  const {
    data: chartStats,
    isLoading: isDataLoading,
    isFetching,
  } = useGetSalerRevenueDataQuery(selectedSaleId, filter);

  // Auto select first saler when list is loaded
  useEffect(() => {
    if (salers && salers.length > 0 && !selectedSaleId) {
      setSelectedSaleId(salers[0]._id);
    }
  }, [salers, selectedSaleId]);

  const showSkeleton = isSalersLoading || (isDataLoading && !chartStats);

  return (
    <div className="flex flex-col h-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all hover:shadow-md overflow-hidden relative">
      {/* Background Fetching Indicator */}
      {isFetching && !isDataLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/10 overflow-hidden z-10">
          <div
            className="h-full bg-primary animate-[loading_1.5s_infinite_linear]"
            style={{ width: "30%" }}
          />
        </div>
      )}

      <div className="shrink-0">
        <ChartHeader
          title="Doanh thu theo Sale"
          filterOptions={filterOptions}
          selectedFilter={filter}
          onSelectFilter={handleSelectFilter}
          extraControl={
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                Nhân viên:
              </span>
              <Select value={selectedSaleId} onValueChange={handleSelectSale}>
                <SelectTrigger className="w-[120px] md:w-[180px] h-9 border-slate-200">
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {salers?.map((saler: any) => (
                    <SelectItem key={saler._id} value={saler._id}>
                      {saler.displayName || saler.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="min-w-[400px] h-full relative">
          {showSkeleton ? (
            <div className="absolute inset-0 flex flex-col p-6 gap-6 animate-pulse">
              <div className="flex-1 bg-slate-50 rounded-2xl" />
              <div className="w-[300px] bg-slate-50 rounded-2xl" />
            </div>
          ) : (
            <SalerRevenueChart
              chartData={chartStats?.chartData || []}
              topProducts={chartStats?.topProducts || []}
            />
          )}
        </div>
      </div>
    </div>
  );
});

RevenueSalesBarChart.displayName = "RevenueSalesBarChart";
