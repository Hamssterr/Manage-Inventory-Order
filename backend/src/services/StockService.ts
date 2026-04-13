import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import StockLog from "../models/StockLog.js";
import Product from "../models/Product.js";

class StockService {
  // Cập nhật kho và ghi log tự động
  async updateStock(
    productId: string | mongoose.Types.ObjectId,
    quantity: number,
    type: "IMPORT" | "EXPORT" | "ADJUST",
    reason: string,
    userId: undefined | mongoose.Types.ObjectId,
    session?: mongoose.ClientSession,
  ) {
    const product = await Product.findById(productId).session(session || null);
    if (!product) throw new ErrorResponse("Product not found", 404);

    if (
      product.isCombo &&
      product.components &&
      product.components.length > 0
    ) {
      for (const comp of product.components) {
        const compQty = quantity * comp.quantityPerBaseUnit;
        await this.updateStock(
          comp.productId,
          compQty,
          type,
          reason,
          userId,
          session,
        );
      }
      return;
    }

    // 1. Cập nhật hoặc tạo mới bản ghi Stock
    const stock = await Stock.findOneAndUpdate(
      { productId },
      {
        $inc: { totalQuantity: quantity },
        $set: { lastUpdated: new Date() },
      },
      {
        upsert: true,
        returnDocument: "after",
        session,
      },
    );

    if (stock.totalQuantity < 0) {
      throw new ErrorResponse(
        "Number of quantity is not enough for this transition",
        400,
      );
    }

    const log = new StockLog({
      productId,
      type,
      quantity,
      reason,
      createdBy: userId,
    });
    await log.save({ session });

    return stock;
  }

  // Lấy tồn kho hiện tại của một sản phẩm
  async getStockByProduct(productId: string | mongoose.Types.ObjectId) {
    return await Stock.findOne({ productId });
  }

  /**
   * Internal helper to recursively expand combos into physical products.
   * @param updates Map of productId -> quantity
   * @param session Mongodb session
   */
  private async _resolvePhysicalQuantities(
    updates: Map<string, number>,
    session?: mongoose.ClientSession,
  ): Promise<Map<string, number>> {
    const physicalMap = new Map<string, number>();
    const productIds = Array.from(updates.keys());

    if (productIds.length === 0) return physicalMap;

    // Batch fetch all products in this level
    const products = await Product.find({
      _id: { $in: productIds },
    }).session(session || null);
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const [id, qty] of updates.entries()) {
      const product = productMap.get(id);
      if (!product) throw new ErrorResponse(`Product not found: ${id}`, 404);

      if (
        product.isCombo &&
        product.components &&
        product.components.length > 0
      ) {
        // Expand combo components
        const comboUpdates = new Map<string, number>();
        for (const comp of product.components) {
          const compQty = qty * comp.quantityPerBaseUnit;
          comboUpdates.set(comp.productId.toString(), compQty);
        }
        // Recursively resolve sub-components
        const resolvedSub = await this._resolvePhysicalQuantities(
          comboUpdates,
          session,
        );
        for (const [subId, subQty] of resolvedSub.entries()) {
          physicalMap.set(subId, (physicalMap.get(subId) || 0) + subQty);
        }
      } else {
        // Physical product
        physicalMap.set(id, (physicalMap.get(id) || 0) + qty);
      }
    }

    return physicalMap;
  }

  async bulkUpdateStock(
    updates: {
      productId: string | mongoose.Types.ObjectId;
      quantity: number;
    }[],
    type: "IMPORT" | "EXPORT" | "ADJUST",
    reason: string,
    userId: undefined | mongoose.Types.ObjectId,
    session: mongoose.ClientSession,
  ) {
    if (!updates || updates.length === 0) return;

    // 1. Group initial updates by productId to handle duplicates if any
    const initialMap = new Map<string, number>();
    for (const update of updates) {
      const pid = update.productId.toString();
      initialMap.set(pid, (initialMap.get(pid) || 0) + update.quantity);
    }

    // 2. Resolve all physical products (expand combos)
    const physicalMap = await this._resolvePhysicalQuantities(
      initialMap,
      session,
    );

    // 3. Prepare BulkWrite operations and Logs
    const bulkOps = [];
    const logs = [];

    for (const [pid, qty] of physicalMap.entries()) {
      bulkOps.push({
        updateOne: {
          filter: { productId: new mongoose.Types.ObjectId(pid) },
          update: {
            $inc: { totalQuantity: qty },
            $set: { lastUpdated: new Date() },
          },
          upsert: true,
        },
      });

      logs.push({
        productId: new mongoose.Types.ObjectId(pid),
        type,
        quantity: qty,
        reason,
        createdBy: userId,
      });
    }

    // 4. Execute Bulk Write to Stock
    if (bulkOps.length > 0) {
      await Stock.bulkWrite(bulkOps, { session });
    }

    // 5. Insert Logs in bulk
    if (logs.length > 0) {
      await StockLog.insertMany(logs, { session });
    }

    // 6. Safety check: ensure no physical stock is negative after update
    const physicalIds = Array.from(physicalMap.keys()).map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    const negativeStocks = await Stock.find({
      productId: { $in: physicalIds },
      totalQuantity: { $lt: 0 },
    }).session(session);

    if (negativeStocks.length > 0) {
      throw new ErrorResponse(
        "Some products do not have enough stock for this transition",
        400,
      );
    }
  }
}

export default new StockService();
