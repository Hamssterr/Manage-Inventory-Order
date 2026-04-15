import type { BaseDetailResponse, BaseListResponse } from "./pagination";
import type { IProduct, IProductUnit } from "./product";

export interface InventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface IImportInventoryRequest {
  unitName: string;
  quantity: number;
  note?: string;
}

export type GetInventoryListProduct = BaseListResponse<IProduct>;

export type ICreateInventoryPayload = Pick<
  IProduct,
  "name" | "sku" | "category" | "baseUnit" | "isSale" | "isGift"
> & { units: Omit<IProductUnit, "_id">[] };

export type CreateInventoryResponse = BaseListResponse<IProduct>;

export type ImportInventoryResponse = BaseListResponse<
  Required<Pick<IProduct, "isCombo" | "totalBaseQuantity">>
>;

export type DeleteInventoryProductResponse = Omit<
  BaseDetailResponse<unknown>,
  "data"
>;
