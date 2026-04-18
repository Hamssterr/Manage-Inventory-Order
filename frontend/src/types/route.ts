import type {
  BaseDetailResponse,
  BaseListResponse,
  BaseResponse,
} from "./pagination";

export interface IRouteSaleRep {
  _id: string;
  phoneNumber: string;
  displayName: string;
}

export interface IRoute {
  _id: string;
  routeName: string;
  description?: string;

  responsibleSale: IRouteSaleRep[] | string[];

  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface RouteParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ICreateRouteRequest {
  routeName: string;
  description?: string;
  responsibleSale: string[];
}

export type CreateRouteResponse = BaseDetailResponse<IRoute>;
export type GetAllRouteResponse = BaseListResponse<IRoute>;
export type IUpdateRouteRequest = Partial<ICreateRouteRequest>;
export type DeleteRouteResponse = BaseResponse;
