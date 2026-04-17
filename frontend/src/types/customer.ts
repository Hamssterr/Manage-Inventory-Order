import type {
  BaseDetailResponse,
  BaseListResponse,
  BaseResponse,
} from "./pagination";
import type { IUserInfo } from "./user";

export interface IRouteMini {
  _id: string;
  routeName: string;
}

export interface ISaleRepMini {
  _id: string;
  displayName: string;
}

export interface ICustomerAddress {
  _id?: string;
  addressDetail: string;
  ward: string;
  district: string;
  province: string;
  routeId: IRouteMini | string;
}

export interface ICustomer {
  _id: string;
  taxCode: string;
  name: string;
  phoneNumber: string;

  saleRep: ISaleRepMini | string;
  addresses: ICustomerAddress;

  createdBy: IUserInfo | string;
  updatedBy: IUserInfo | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CustomerParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ICreateCustomerRequest {
  name: string;
  taxCode?: string;
  phoneNumber: string;
  saleRep?: string;
  addresses: {
    addressDetail: string;
    ward: string;
    district: string;
    province: string;
    routeId?: string;
  };
}

export type CreateCustomerResponse = BaseDetailResponse<ICustomer>;
export type GetAllCustomerResponse = BaseListResponse<ICustomer>;
export type IUpdateCustomerRequest = Partial<ICreateCustomerRequest>;
export type DeleteCustomerResponse = BaseResponse;
