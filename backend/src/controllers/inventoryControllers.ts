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
    const { search } = req.query;

    const query: any = { isCombo: false };
    if (search) {
      query.$text = { $search: search as string };
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

export const importProductInventory = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const { unitName, quantity, note } = req.body;
    const userId = req.user?._id;

    if (!productId || !unitName || quantity <= 0) {
      throw new ErrorResponse("Import data is invalid", 400);
    }

    const baseQuantity = await ProductService.convertToBaseUnit(
      productId as string,
      unitName,
      quantity,
    );

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const updatedStock = await StockService.updateStock(
        productId as string,
        baseQuantity,
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
