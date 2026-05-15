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

// Saler Revenue
export interface SalerRevenueData {
  chartData: IChartData[];
  topProducts: ITopProduct[];
}

export type SalerRevenueDataResponse = BaseDetailResponse<SalerRevenueData>;

export interface ISellingProduct {
  _id: string;
  productName: string;
  sku: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export type SellingProductsResponse = BaseDetailResponse<ISellingProduct[]>;

// Saler Salary
export interface SalerSalaryParams {
  month: number;
  year: number;
}

export interface ISalaryProduct {
  productId: string;
  productName: string;
  unitName: string;
  totalQuantity: number;
  totalSalary: number;
}

export interface ISalarySummary {
  userName: string;
  phoneNumber: string;
  month: number;
  year: number;
  totalProductsSold: number;
  totalSalary: number;
}

export interface SalerSalaryData {
  summary: ISalarySummary;
  products: ISalaryProduct[];
}

export type SalerSalaryResponse = BaseDetailResponse<SalerSalaryData>;
