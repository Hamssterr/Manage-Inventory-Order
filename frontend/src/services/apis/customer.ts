import type {
  CustomerParams,
  DeleteCustomerResponse,
  GetAllCustomerResponse,
  ICreateCustomerRequest,
  IUpdateCustomerRequest,
} from "@/types/customer";
import http from "../base";
import {
  CreateCustomer,
  DeleteCustomer,
  GetAllCustomer,
  UpdateCustomer,
} from "@/constants/api-endpoints";

export const getAllCustomer = (params: CustomerParams) => {
  return http.get<GetAllCustomerResponse>(GetAllCustomer, { params });
};

export const createCustomer = (data: ICreateCustomerRequest) => {
  return http.post(CreateCustomer, data);
};

export const updateCustomer = (data: IUpdateCustomerRequest, id: string) => {
  return http.put(`${UpdateCustomer}${id}`, data);
};

export const deleteCustomer = (id: string) => {
  return http.delete<DeleteCustomerResponse>(`${DeleteCustomer}${id}`);
};
