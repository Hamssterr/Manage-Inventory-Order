import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getBarChartData,
  getDashboardStats,
  getSalerRevenueData,
  getSalerSalary,
  getSalerSellingProducts,
} from "@/services/apis/report";
import { QUERY_KEYS } from "@/constants/query-key";
import type {
  BarChartData,
  ChartFilter,
  DashboardStats,
  ISellingProduct,
  SalerRevenueData,
  SalerSalaryData,
  SalerSalaryParams,
} from "@/types/report";

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
    placeholderData: keepPreviousData,
  });
};

export const useGetSalerRevenueDataQuery = (
  id: string,
  filter: ChartFilter,
) => {
  return useQuery<SalerRevenueData>({
    queryKey: [QUERY_KEYS.REPORTS, "saler-revenue", filter, id],
    queryFn: () =>
      getSalerRevenueData({ params: { filter }, id }).then(
        (res) => res.data.data,
      ),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });
};

export const useGetSalerSellingProductsQuery = (
  month?: number,
  year?: number,
) => {
  return useQuery<ISellingProduct[]>({
    queryKey: [QUERY_KEYS.REPORTS, "saler-selling-products", month, year],
    queryFn: () =>
      getSalerSellingProducts({ month, year }).then((res) => res.data.data),
    placeholderData: keepPreviousData,
  });
};

export const useGetSalerSalary = (params: SalerSalaryParams) => {
  return useQuery<SalerSalaryData>({
    queryKey: [QUERY_KEYS.REPORTS, "salary", params],
    queryFn: () => getSalerSalary(params).then((res) => res.data.data),
    placeholderData: keepPreviousData,
  });
};
