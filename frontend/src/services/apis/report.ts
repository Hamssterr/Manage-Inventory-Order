import type {
  BarChartDataResponse,
  DashboardStatsResponse,
  SalerRevenueDataResponse,
  SalerSalaryParams,
  SalerSalaryResponse,
  SellingProductsResponse,
} from "@/types/report";
import {
  GetBarChartData,
  GetDashboardStats,
  GetSalerRevenueData,
  GetSalerSalary,
  GetSalerSellingProducts,
} from "@/constants/api-endpoints";
import http from "../base";

export const getDashboardStats = () => {
  return http.get<DashboardStatsResponse>(GetDashboardStats);
};

export const getBarChartData = (params: any) => {
  return http.get<BarChartDataResponse>(GetBarChartData, { params });
};

export const getGeneralSalesReport = (params: any) => {
  return http.get("/reports/general", { params });
};

export const getSalerRevenueData = ({
  params,
  id,
}: {
  params: any;
  id: string;
}) => {
  return http.get<SalerRevenueDataResponse>(`${GetSalerRevenueData}/${id}`, {
    params,
  });
};

export const getSalerSellingProducts = (params: any) => {
  return http.get<SellingProductsResponse>(GetSalerSellingProducts, { params });
};

export const getSalerSalary = (params: SalerSalaryParams) => {
  return http.get<SalerSalaryResponse>(GetSalerSalary, { params });
};
