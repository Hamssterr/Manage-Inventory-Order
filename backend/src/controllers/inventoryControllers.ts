import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import ProductService from "../services/ProductService.js";
import mongoose from "mongoose";
import StockService from "../services/StockService.js";
import Product, { IProductUnit } from "../models/Product.js";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";
import Stock from "../models/Stock.js";
import StockLog from "../models/StockLog.js";
import { success } from "zod";

export const createInventoryProduct = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { name, sku, category, baseUnit, units, isSale, isGift } = req.body;
      const userId = req.user?._id;

      const normalizedSku = sku.trim().toUpperCase();
      const existingProduct = await Product.findOne({
        sku: normalizedSku,
      }).session(session);
      if (existingProduct) {
        throw new ErrorResponse(
          `Sku code ${normalizedSku} has been existing`,
          400,
        );
      }

      if (!Array.isArray(units) || units.length === 0) {
        throw new ErrorResponse("Product must be have 1 unit", 400);
      }

      const processedUnits = units.map((u: IProductUnit) => ({
        unitName: u.unitName.trim().toLowerCase(),
        exchangeValue: Number(u.exchangeValue),
        priceDefault: Number(u.priceDefault || 0),
        tax: Number(u.tax || 0),
        isDefault: Boolean(u.isDefault),
      }));

      const baseUnitName = baseUnit.trim().toLowerCase();
      const baseUnitInList = processedUnits.find(
        (u) => u.unitName === baseUnitName && u.exchangeValue === 1,
      );
      if (!baseUnitInList)
        throw new ErrorResponse(
          `The unit [${baseUnitName}] must be in the list of units with an exchange value of 1.`,
          400,
        );

      const defaultUnits = processedUnits.filter((u) => u.isDefault);
      if (defaultUnits.length > 1)
        throw new ErrorResponse("Must choose exactly 1 default unit", 400);
      if (defaultUnits.length === 0) {
        processedUnits.find((u) => u.unitName === baseUnitName)!.isDefault =
          true;
      }

      const [newProduct] = await Product.create(
        [
          {
            name: name.trim(),
            sku: normalizedSku,
            category: category || "General",
            baseUnit: baseUnitName,
            isSale: isSale ?? true,
            isGift: isGift ?? true,
            isCombo: false,
            components: [],
            units: processedUnits,
            createdBy: userId,
            updatedBy: userId,
          },
        ],
        { session },
      );

      await StockService.updateStock(
        newProduct._id,
        0,
        "IMPORT",
        "Khởi tạo sản phẩm mới",
        userId,
        session,
      );
      await session.commitTransaction();
      res.status(200).json({
        success: true,
        message: "Create new product successfully",
        data: newProduct,
      });
    } catch (error: any) {
      await session.abortTransaction();
      throw new ErrorResponse(error.message, error.statusCode || 500);
    } finally {
      session.endSession();
    }
  },
);

export const getInventoryProducts = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req);
    const { search, category } = req.query;

    const query: any = { isCombo: false };
    if (search) {
      query.$text = { $search: search as string };
    }
    if (category) {
      query.category = category;
    }

    const [products, totalItems] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const productIds = products.map((p) => p._id);

    const stocks = await Stock.find({ productId: { $in: productIds } }).lean();

    const productWithStock = products.map((product) => {
      const stockInfo = stocks.find(
        (s) => s.productId.toString() === product._id.toString(),
      );
      const totalBaseQty = stockInfo ? stockInfo.totalQuantity : 0;
      const displayQty = ProductService.calculateDisplayQuantity(
        product.units,
        product.baseUnit,
        totalBaseQty,
      );

      return {
        ...product,
        totalBaseQuantity: totalBaseQty,
        displayQuantity: displayQty,
      } as any;
    });

    const response = formatPaginationResponse(
      productWithStock,
      totalItems,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      message: "Get inventory products successfully",
      ...response,
    });
  },
);

export const getInventoryProductById = asyncWrapper(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      isCombo: false,
    }).lean();

    if (!product) {
      throw new ErrorResponse("Product in inventory not found", 404);
    }

    const stockInfo = await Stock.findOne({ productId }).lean();
    const totalBaseQty = stockInfo ? stockInfo.totalQuantity : 0;

    const displayQty = ProductService.calculateDisplayQuantity(
      product.units,
      product.baseUnit,
      totalBaseQty,
    );

    res.status(200).json({
      success: true,
      message: "Get inventory product successfully",
      data: {
        ...product,
        totalBaseQuantity: totalBaseQty,
        displayQuantity: displayQty,
      },
    });
  },
);

export const updateInventoryProduct = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const { name, category, baseUnit, units, isSale, isGift, sku } = req.body;
    const userId = req.user?._id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findOne({
        _id: productId,
        isCombo: false,
      }).session(session);
      if (!product) {
        throw new ErrorResponse("Product in inventory not found", 404);
      }

      const normalizedSku = sku.trim().toUpperCase();
      const existingSku = await Product.exists({
        sku: normalizedSku,
        _id: { $ne: product._id },
      }).session(session);
      if (existingSku) {
        throw new ErrorResponse("Sku code already exists", 400);
      }

      if (!Array.isArray(units) || units.length === 0) {
        throw new ErrorResponse("Product must have at least 1 unit", 400);
      }

      const processedUnits = units.map((unit) => ({
        unitName: unit.unitName.trim().toLowerCase(),
        exchangeValue: Number(unit.exchangeValue),
        priceDefault: Number(unit.priceDefault || 0),
        isDefault: Boolean(unit.isDefault),
      }));

      const baseUnitName = baseUnit.trim().toLowerCase();
      const baseUnitInList = processedUnits.find(
        (unit) => unit.unitName === baseUnitName && unit.exchangeValue === 1,
      );
      if (!baseUnitInList) {
        throw new ErrorResponse(
          `The unit [${baseUnitName}] must be in the list of units with an exchange value of 1.`,
          400,
        );
      }

      const defaultUnits = processedUnits.filter((unit) => unit.isDefault);
      if (defaultUnits.length > 1) {
        throw new ErrorResponse("Product can only have one default unit", 400);
      }
      if (defaultUnits.length === 0) {
        processedUnits.find(
          (unit) => unit.unitName === baseUnitName,
        )!.isDefault = true;
      }

      product.name = name.trim();
      product.sku = normalizedSku;
      product.category = category || "General";
      product.baseUnit = baseUnitName;
      product.units = processedUnits;

      product.isSale = isSale ?? product.isSale;
      product.isGift = isGift ?? product.isGift;

      if (userId) {
        product.updatedBy = userId as mongoose.Types.ObjectId;
      }

      await product.save({ session });
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: "Update product successfully",
        data: product,
      });
    } catch (error: any) {
      await session.abortTransaction();
      throw new ErrorResponse(error.message, error.statusCode || 500);
    } finally {
      session.endSession();
    }
  },
);

export const importProductInventory = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const { unitName, quantity, note } = req.body;
    const userId = req.user?._id;

    if (!productId || !unitName || quantity <= 0) {
      throw new ErrorResponse("Dữ liệu nhập kho không hợp lệ", 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ErrorResponse("Không tìm thấy sản phẩm", 404);
    }

    const normalizedUnitName = unitName.trim().toLowerCase();
    const selectedUnit = product.units.find(
      (unit) => unit.unitName.toLowerCase() === normalizedUnitName,
    );

    if (!selectedUnit) {
      const validUnit = product.units.map((unit) => unit.unitName).join(", ");
      throw new ErrorResponse(
        `Đơn vị ${unitName} không hợp lệ. Sản phẩm này chỉ hỗ trợ: ${validUnit}`,
        400,
      );
    }

    // Tính số lượng
    const baseQty = quantity * selectedUnit.exchangeValue;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedStock = await StockService.updateStock(
        productId as string,
        baseQty,
        "IMPORT",
        note || `Import ${quantity} ${unitName} of product`,
        userId,
        session,
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Import inventory successfully",
        data: {
          isCombo: !updatedStock,
          totalBaseQuantity: updatedStock
            ? updatedStock.totalQuantity
            : "Updated inside components",
        },
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorResponse(error.message, 400);
    }
  },
);

export const deleteInventoryProduct = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findOne({
        _id: productId,
        isCombo: false,
      }).session(session);

      if (!product) {
        throw new ErrorResponse("Không tìm thấy sản phẩm trong kho", 404);
      }

      const usedInCombo = await Product.findOne({
        isCombo: true,
        "components.productId": productId,
      }).session(session);

      if (usedInCombo) {
        throw new ErrorResponse(
          `Không thể xóa! Sản phẩm này đang là thành phần của gói Combo: [${usedInCombo.name}]. Vui lòng gỡ khỏi Combo trước khi xóa.`,
          400,
        );
      }

      const stock = await Stock.findOne({ productId: productId }).session(
        session,
      );
      if (stock && stock.totalQuantity > 0) {
        throw new ErrorResponse(
          `Không thể xóa! Sản phẩm đang còn tồn kho (${stock.totalQuantity}). Vui lòng tạo phiếu xuất hủy để đưa tồn kho về 0 trước.`,
          400,
        );
      }

      await Product.findByIdAndDelete(productId).session(session);
      if (stock) {
        await Stock.findByIdAndDelete(stock._id).session(session);
      }
      await StockLog.deleteMany({ productId: productId }).session(session);
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: "Đã xóa sản phẩm trong kho thành công",
      });
    } catch (error: any) {
      await session.abortTransaction();
      throw new ErrorResponse(error.message, error.statusCode || 500);
    } finally {
      session.endSession();
    }
  },
);
