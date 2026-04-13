import Order, { IOrderItem } from "../models/Order.js";
import Product from "../models/Product.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import ProductService from "./ProductService.js";
import mongoose from "mongoose";

class OrderService {
  generateOrderCode(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    return `DH-${dateStr}-${randomStr}`;
  }

  generateExportTicketCode(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    return `PX-${dateStr}-${randomStr}`;
  }

  async processOrderItems(items: IOrderItem[]) {
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new ErrorResponse("Product not found", 404);
      }

      const unitInfo = product.units.find(
        (u) =>
          u.unitName.toLocaleLowerCase() ===
          item.unitNameSnapshot.toLocaleLowerCase(),
      );

      if (!unitInfo) {
        throw new ErrorResponse("Invalid unit for product", 400);
      }

      const priceUnit = unitInfo.priceDefault || 0;
      const subTotal = item.quantity * priceUnit;

      processedItems.push({
        productId: item.productId,
        skuSnapshot: product.sku,
        productNameSnapshot: product.name,
        unitNameSnapshot: unitInfo.unitName,
        exchangeValueSnapshot: unitInfo.exchangeValue,
        quantity: item.quantity,
        priceUnit,
        subTotal,
        isGift: item.isGift,
        promotionId: item.promotionId,
      });

      totalAmount += subTotal;
    }

    return { processedItems, totalAmount };
  }

  async getExportTicketItems(orderIds: mongoose.Types.ObjectId[]) {
    const aggregatedItems = await Order.aggregate([
      { $match: { _id: { $in: orderIds }, status: "pending" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $project: {
          pickList: {
            $cond: {
              if: { $eq: ["$productData.isCombo", true] },
              then: {
                $map: {
                  input: "$productData.components",
                  as: "comp",
                  in: {
                    productId: "$$comp.productId",
                    exportQty: {
                      $multiply: [
                        "$items.quantity",
                        "$items.exchangeValueSnapshot",
                        "$$comp.quantityPerBaseUnit",
                      ],
                    },
                  },
                },
              },
              else: [
                {
                  productId: "$items.productId",
                  exportQty: {
                    $multiply: [
                      "$items.quantity",
                      "$items.exchangeValueSnapshot",
                    ],
                  },
                },
              ],
            },
          },
        },
      },
      { $unwind: "$pickList" },
      {
        $group: {
          _id: "$pickList.productId",
          totalBaseQty: { $sum: "$pickList.exportQty" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "finalProduct",
        },
      },
      { $unwind: "$finalProduct" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$finalProduct.name",
          sku: "$finalProduct.sku",
          unitName: "$finalProduct.baseUnit",
          totalQuantity: "$totalBaseQty",
          baseQuantityToExport: "$totalBaseQty",
        },
      },
      { $sort: { productName: 1 } },
    ]);

    const finalItems = await Promise.all(
      aggregatedItems.map(async (item) => {
        const displayQuantity = await ProductService.getDisplayQuantity(
          item.productId,
          item.totalQuantity,
        );
        return {
          ...item,
          displayQuantity,
        };
      }),
    );

    return finalItems;
  }
}

export default new OrderService();
