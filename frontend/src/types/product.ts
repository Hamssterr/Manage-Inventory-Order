import type { IUserInfo } from "./user";

interface IMiniProduct {
  _id: string;
  name: string;
  baseUnit: string;
}

interface IProductUnit {
  _id: string;
  unitName: string;
  exchangeValue: number;
  priceDefault: number;
  isDefault: boolean;
}

interface IProductComponent {
  productId: IMiniProduct;
  quantityPerBaseUnit: number;
  _id: string;
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

  // Metadata
  createdBy: IUserInfo;
  updatedBy: IUserInfo;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

