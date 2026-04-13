import http from "../base";
import { GetInventoryProduct } from "@/constants/api-endpoints";
import type {
  GetInventoryListProduct,
  InventoryParams,
} from "@/types/inventory";

export const getInventoryProduct = (params?: InventoryParams) => {
  return http.get<GetInventoryListProduct>(GetInventoryProduct, { params });
};
