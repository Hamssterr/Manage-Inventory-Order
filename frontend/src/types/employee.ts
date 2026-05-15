import type {
  BaseDetailResponse,
  BaseListResponse,
  BaseResponse,
} from "./pagination";

export interface EmployeeParams {
  page?: number;
  limit?: number;
  search?: string;
  month?: number;
  year?: number;
}

export type EmployeeRole = "salers" | "accountant";

export interface Employee {
  _id: string;
  phoneNumber: string;
  email?: string;
  displayName: string;
  role: EmployeeRole;
}

export type GetAllEmployeeResponse = BaseListResponse<Employee>;

export interface ICreateEmployeeRequest {
  phoneNumber: string;
  email: string;
  displayName: string;
  role: EmployeeRole;
}

export type CreateEmployeeResponse = BaseResponse;
export type ResetEmployeePasswordResponse = BaseResponse;

export interface ISalaryDetail {
  productId: string;
  productName: string;
  unitName: string;
  totalQuantity: number;
  totalSalary: number;
  displayText: string;
}

export interface ISalarySummary {
  employeeName: string;
  employeePhone: string;
  month: number;
  year: number;
  totalProductsSold: number;
  totalSalaryEarned: number;
}

export interface ISalaryReportData {
  summary: ISalarySummary;
  details: ISalaryDetail[];
}

export type GetSalaryReportResponse = BaseDetailResponse<ISalaryReportData>;
