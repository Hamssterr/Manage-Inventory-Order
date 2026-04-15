import http from "../base";
import {
  CreateInventoryProduct,
  DeleteInventoryProduct,
  GetInventoryProduct,
  ImportInventoryProduct,
  UpdateInventoryProduct,
} from "@/constants/api-endpoints";
import type {
  CreateInventoryResponse,
  DeleteInventoryProductResponse,
  GetInventoryListProduct,
  ICreateInventoryPayload,
  IImportInventoryRequest,
  ImportInventoryResponse,
  InventoryParams,
} from "@/types/inventory";

export const getInventoryProduct = (params?: InventoryParams) => {
  return http.get<GetInventoryListProduct>(GetInventoryProduct, { params });
};

export const createInventoryProduct = (data: ICreateInventoryPayload) => {
  return http.post<CreateInventoryResponse>(CreateInventoryProduct, data);
};

export const updateInventoryProduct = (
  id: string,
  data: ICreateInventoryPayload,
) => {
  return http.put<CreateInventoryResponse>(
    `${UpdateInventoryProduct}${id}`,
    data,
  );
};

export const importInventoryProduct = (
  data: IImportInventoryRequest,
  id: string,
) => {
  return http.post<ImportInventoryResponse>(
    `${ImportInventoryProduct}${id}/import`,
    data,
  );
};

export const deleteInventoryProduct = (id: string) => {
  return http.delete<DeleteInventoryProductResponse>(
    `${DeleteInventoryProduct}${id}`,
  );
};
