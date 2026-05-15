import type {
  CreateEmployeeResponse,
  EmployeeParams,
  GetAllEmployeeResponse,
  ICreateEmployeeRequest,
  ResetEmployeePasswordResponse,
  GetSalaryReportResponse,
} from "@/types/employee";
import http from "../base";
import {
  CreateEmployee,
  GetEmployees,
  ResetEmployeePassword,
} from "@/constants/api-endpoints";

export const getAllEmployee = (params: EmployeeParams) => {
  return http.get<GetAllEmployeeResponse>(GetEmployees, { params });
};

export const createEmployee = (data: ICreateEmployeeRequest) => {
  return http.post<CreateEmployeeResponse>(CreateEmployee, data);
};

export const resetEmployeePassword = (id: string) => {
  return http.post<ResetEmployeePasswordResponse>(
    `${ResetEmployeePassword}${id}/reset`,
  );
};

export const deleteEmployee = (id: string) => {
  return http.delete<CreateEmployeeResponse>(`${GetEmployees}${id}`);
};

export const getEmployeeSalary = (id: string, params: EmployeeParams) => {
  return http.get<GetSalaryReportResponse>(`${GetEmployees}${id}/salary`, {
    params,
  });
};
