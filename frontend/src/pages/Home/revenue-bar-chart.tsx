import type { ChartFilter } from "@/types/report";
import { ChartHeader } from "./components/chart/chart-header";
import { LineChart } from "./components/chart/line-chart";
import { useCallback, useState } from "react";
import { useGetBarChartDataQuery } from "@/hooks/useReport";

export const RevenueBarChart = () => {
  const [filter, setFilter] = useState<ChartFilter>("Tuần");
  const filterOptions: ChartFilter[] = ["Tuần", "Tháng", "Năm"];

  const handleSelectFilter = useCallback((f: string) => {
    setFilter(f as ChartFilter);
  }, []);

  const {
    data: chartStats,
    isLoading,
    isFetching,
  } = useGetBarChartDataQuery(filter);

  const showSkeleton = isLoading && !chartStats;

  return (
    <div className="flex flex-col h-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all hover:shadow-md overflow-hidden relative">
      {/* Background Fetching Indicator */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/10 overflow-hidden z-10">
          <div
            className="h-full bg-primary animate-[loading_1.5s_infinite_linear]"
            style={{ width: "30%" }}
          />
        </div>
      )}

      <div className="shrink-0">
        <ChartHeader
          title="Doanh thu"
          filterOptions={filterOptions}
          selectedFilter={filter}
          onSelectFilter={handleSelectFilter}
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
            <LineChart
              chartData={chartStats?.chartData || []}
              topProducts={chartStats?.topProducts || []}
            />
          )}
        </div>
      </div>
    </div>
  );
};
