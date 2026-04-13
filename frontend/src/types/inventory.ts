import type { BaseListResponse } from "./pagination";
import type { IProduct } from "./product";

export type GetInventoryListProduct = BaseListResponse<IProduct>;

export interface InventoryParams {
  page?: number;
  limit?: number;
  search?: string;
}
