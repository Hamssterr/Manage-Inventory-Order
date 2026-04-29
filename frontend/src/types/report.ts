import type { BaseDetailResponse } from "./pagination";

export interface IChartData {
  label: string;
  value: number;
}

export interface ITopProduct {
  _id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueTrend: number;
  totalOrders: number;
  ordersTrend: number;
  newCustomers: number;
  customersTrend: number;
}

export type DashboardStatsResponse = BaseDetailResponse<DashboardStats>;

// Bar Chart
export interface BarChartData {
  chartData: IChartData[];
  topProducts: ITopProduct[];
}

export type ChartFilter = "Tuần" | "Tháng" | "Năm";

export type BarChartDataResponse = BaseDetailResponse<BarChartData>;
