import type {
  BarChartDataResponse,
  DashboardStatsResponse,
} from "@/types/report";
import { GetBarChartData, GetDashboardStats } from "@/constants/api-endpoints";
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
