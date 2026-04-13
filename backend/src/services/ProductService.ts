import type mongoose from "mongoose";
import Product from "../models/Product.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";

class ProductService {
  // Quy đổi số lượng
  // (Ví dụ: 2 bao (1 bao = 12 gói) -> 24 gói)
  async convertToBaseUnit(
    productId: string | mongoose.Types.ObjectId,
    unitName: string,
    quantity: number,
  ): Promise<number> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    //   Tìm đơn vị phù hợp
    const unit = product.units.find(
      (u) => u.unitName.toLowerCase() === unitName.toLocaleLowerCase(),
    );
    if (!unit) {
      throw new ErrorResponse(
        `Unit ${unitName} is not suitable for this Product`,
        400,
      );
    }

    return quantity * unit.exchangeValue;
  }

  //Quy đổi ngược từ baseUnit ra thông tin hiển thị cho con người
  // (Ví dụ: 25 gói (1 bao = 12 gói) -> "2 bao, 1 gói)
  calculateDisplayQuantity(
    units: any[],
    baseUnit: string,
    totalBaseQuantity: number,
  ): string {
    // Sắp xếp đơn vị từ lớn đến nhỏ để quy đổi (ví dụ: Thùng -> Bao -> Gói)
    const sortedUnits = [...units].sort(
      (a, b) => b.exchangeValue - a.exchangeValue,
    );

    let remaining = totalBaseQuantity;
    const result: string[] = [];

    for (const unit of sortedUnits) {
      if (unit.exchangeValue === 0) continue;

      const count = Math.floor(remaining / unit.exchangeValue);
      if (count > 0) {
        result.push(`${count} ${unit.unitName}`);
        remaining %= unit.exchangeValue;
      }
    }

    return result.length > 0 ? result.join(", ") : `0 ${baseUnit}`;
  }

  async getDisplayQuantity(
    productId: string | mongoose.Types.ObjectId,
    totalBaseQuantity: number,
  ): Promise<string> {
    const product = await Product.findById(productId).lean();
    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    return this.calculateDisplayQuantity(
      product.units,
      product.baseUnit,
      totalBaseQuantity,
    );
  }

  // Tự điền giá vào đơn hàng khi thêm vào Order
  async getDefaultPrice(
    productId: string | mongoose.Types.ObjectId,
    unitName: string,
  ): Promise<number> {
    const product = await Product.findById(productId);
    const unit = product?.units.find((u) => u.unitName === unitName);
    return unit?.priceDefault || 0;
  }
}

export default new ProductService();
