import { useQuery } from "@tanstack/react-query";
import { getBarChartData, getDashboardStats } from "@/services/apis/report";
import { QUERY_KEYS } from "@/constants/query-key";
import type { BarChartData, ChartFilter, DashboardStats } from "@/types/report";

export const useGetDashboardStatsQuery = () => {
  return useQuery<DashboardStats>({
    queryKey: [QUERY_KEYS.REPORTS],
    queryFn: () => getDashboardStats().then((res) => res.data.data),
  });
};

export const useGetBarChartDataQuery = (filter: ChartFilter) => {
  return useQuery<BarChartData>({
    queryKey: [QUERY_KEYS.REPORTS, "chart", filter],
    queryFn: () => getBarChartData({ filter }).then((res) => res.data.data),
  });
};
