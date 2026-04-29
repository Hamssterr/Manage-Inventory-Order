import type { ChartFilter } from "@/types/report";
import { ChartHeader } from "./components/chart/chart-header";
import { LineChart } from "./components/chart/line-chart";
import { useState } from "react";
import { useGetBarChartDataQuery } from "@/hooks/useReport";

export const BarChart = () => {
  const [filter, setFilter] = useState<ChartFilter>("Tuần");
  const filterOptions: ChartFilter[] = ["Tuần", "Tháng", "Năm"];

  const { data: chartStats, isLoading } = useGetBarChartDataQuery(filter);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white animate-pulse">
        <div className="h-16 border-b border-slate-100" />
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all hover:shadow-md overflow-hidden">
      <div className="shrink-0">
        <ChartHeader
          title="Doanh thu"
          filterOptions={filterOptions}
          selectedFilter={filter}
          onSelectFilter={(filter) => setFilter(filter as ChartFilter)}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="min-w-[400px] h-full">
          <LineChart
            chartData={chartStats?.chartData || []}
            topProducts={chartStats?.topProducts || []}
          />
        </div>
      </div>
    </div>
  );
};
