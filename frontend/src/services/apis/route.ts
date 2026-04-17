import type {
  DeleteRouteResponse,
  GetAllRouteResponse,
  ICreateRouteRequest,
  IRoute,
  IUpdateRouteRequest,
  RouteParams,
} from "@/types/route";
import http from "../base";
import {
  CreateRoute,
  DeleteRoute,
  GetAllRoute,
  UpdateRoute,
} from "@/constants/api-endpoints";

export const getAllRoute = (params?: RouteParams) => {
  return http.get<GetAllRouteResponse>(GetAllRoute, { params });
};

export const createRoute = (data: ICreateRouteRequest) => {
  return http.post<IRoute>(CreateRoute, data);
};

export const updateRoute = (data: IUpdateRouteRequest, id: string) => {
  return http.put(`${UpdateRoute}${id}`, data);
};

export const deleteRoute = (id: string) => {
  return http.delete<DeleteRouteResponse>(`${DeleteRoute}${id}`);
};
