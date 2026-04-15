import type { BaseListResponse } from "./pagination";
import type { IUserInfo } from "./user";

interface IMiniProduct {
  _id: string;
  name: string;
  sku: string;
  baseUnit?: string;
}

export interface IProductUnit {
  unitName: string;
  exchangeValue: number;
  priceDefault: number;
  isDefault: boolean;
}

interface IProductComponent {
  productId: IMiniProduct;
  quantityPerBaseUnit: number;
}

export interface IProduct {
  _id: string;
  sku: string;
  name: string;
  category: string;
  baseUnit: string;

  // Trạng thái & Phân loại
  isSale: boolean;
  isGift: boolean;
  isCombo: boolean;

  // Dữ liệu mảng
  units: IProductUnit[];
  components: IProductComponent[];

  // Thông tin kho & hiển thị
  totalBaseQuantity?: number;
  totalQuantity?: number;
  stockDisplay?: string;
  displayQuantity?: string;

  // Metadata
  createdBy: IUserInfo | string;
  updatedBy: IUserInfo | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export type GetProductResponse = BaseListResponse<IProduct>;
