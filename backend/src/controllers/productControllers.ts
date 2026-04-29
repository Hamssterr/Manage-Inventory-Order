import type { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import Product, { IProductUnit } from "../models/Product.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import StockService from "../services/StockService.js";
import Stock from "../models/Stock.js";
import ProductService from "../services/ProductService.js";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";

export const createSaleProduct = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { name, sku, units, baseUnit, category, isSale, components } =
        req.body;
      const userId = req.user?._id;

      const normalizedSku = sku.trim().toUpperCase();
      const existingProduct = await Product.findOne({
        sku: normalizedSku,
      }).session(session);
      if (existingProduct)
        throw new ErrorResponse(
          `Sku code ${normalizedSku} has been existing`,
          400,
        );

      if (!Array.isArray(components) || components.length === 0) {
        throw new ErrorResponse(
          "Components is required at least 1 product",
          400,
        );
      }

      // Kiểm tra sản phẩm có tồn tại không
      const componentIds = components.map(
        (c) => new mongoose.Types.ObjectId(c.productId),
      );
      const validProductsCount = await Product.countDocuments({
        _id: { $in: componentIds },
      }).session(session);
      if (validProductsCount !== components.length) {
        throw new ErrorResponse("Some components are invalid", 400);
      }

      // Kiểm tra đơn vị Units
      const processedUnits = units.map((u: any) => ({
        unitName: u.unitName.trim().toLowerCase(),
        exchangeValue: Number(u.exchangeValue),
        priceDefault: Number(u.priceDefault || 0),
        tax: Number(u.tax || 0),
        isDefault: Boolean(u.isDefault || u.isDefalut),
      }));

      const baseUnitName = baseUnit.trim().toLowerCase();
      const baseUnitInList = processedUnits.find(
        (u: IProductUnit) =>
          u.unitName === baseUnitName && u.exchangeValue === 1,
      );
      if (!baseUnitInList)
        throw new ErrorResponse(
          `The unit [${baseUnitName}] must be in the list of units with an exchange value of 1.`,
          400,
        );

      const defaultUnits = processedUnits.filter(
        (u: IProductUnit) => u.isDefault,
      );
      if (defaultUnits.length > 1)
        throw new ErrorResponse("Must choose exactly 1 default unit", 400);
      if (defaultUnits.length === 0)
        processedUnits.find(
          (u: IProductUnit) => u.unitName === baseUnitName,
        )!.isDefault = true;

      // Tạo product
      const [newProduct] = await Product.create(
        [
          {
            name: name.trim(),
            sku: normalizedSku,
            category: category || "General",
            baseUnit: baseUnitName,
            isSale: isSale ?? true,
            isGift: false,
            isCombo: true,
            components: components,
            units: processedUnits,
            createdBy: userId,
            updatedBy: userId,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      res.status(200).json({
        success: true,
        message: "Create new combo product successfully",
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

export const getSaleProducts = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req);
    const { category, search } = req.query;

    const query: any = { isCombo: true };

    if (category) query.category = category;
    if (search) query.$text = { $search: search as string };

    const [products, totalItems] = await Promise.all([
      Product.find(query)
        .populate("components.productId", "name sku")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    const response = formatPaginationResponse(
      products,
      totalItems,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      message: "Get sale products successfully",
      ...response,
    });
  },
);

// export const getProductList = asyncWrapper(
//   async (req: Request, res: Response) => {
//     const { page, limit, skip } = getPaginationParams(req);

//     const products = await Product.aggregate([
//       {
//         $lookup: {
//           from: "stocks",
//           localField: "_id",
//           foreignField: "productId",
//           as: "stockInfo",
//         },
//       },
//       { $unwind: { path: "$stockInfo", preserveNullAndEmptyArrays: true } },
//       {
//         $project: {
//           name: 1,
//           sku: 1,
//           units: 1, // Trả về toàn bộ mảng units để kế toán chọn đơn vị nhập
//           baseUnit: 1,
//           totalBaseQuantity: { $ifNull: ["$stockInfo.totalQuantity", 0] },
//           createdAt: 1,
//         },
//       },
//       { $sort: { createdAt: -1 } },
//       { $skip: skip },
//       { $limit: limit },
//     ]);

//     const totalItems = await Product.countDocuments();

//     res.status(200).json({
//       success: true,
//       ...formatPaginationResponse(products, totalItems, page, limit),
//     });
//   },
// );

export const getProductDetail = asyncWrapper(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("createdBy", "displayName email")
      .populate("updatedBy", "displayName email")
      .populate("components.productId", "name baseUnit");

    if (!product) {
      throw new ErrorResponse("Product not found", 404);
    }

    const stock = await Stock.findOne({ productId });
    const totalBaseQuantity = stock ? stock.totalQuantity : 0;

    const stockDisplay = await ProductService.getDisplayQuantity(
      productId as string,
      totalBaseQuantity,
    );

    res.status(200).json({
      success: true,
      message: "Get product detail successfully",
      data: {
        ...product.toObject(),
        totalQuantity: totalBaseQuantity,
        stockDisplay: stockDisplay,
      },
    });
  },
);

export const updateSaleProduct = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;
    const { name, sku, units, baseUnit, category, isSale, components } =
      req.body;
    const userId = req?.user?._id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findOne({
        _id: productId,
        isCombo: true,
      }).session(session);
      if (!product) {
        throw new ErrorResponse("Không tìm thấy sản phẩm", 404);
      }

      const normalizedSku = sku.trim().toUpperCase();
      const existingSku = await Product.findOne({
        sku: normalizedSku,
        _id: { $ne: product._id },
      }).session(session);
      if (existingSku) {
        throw new ErrorResponse(`Sku code ${normalizedSku} đã tồn tại`, 400);
      }

      if (!Array.isArray(components) || components.length === 0) {
        throw new ErrorResponse("Vật phẩm con cần ít nhất 1 sản phẩm", 400);
      }

      const componentIds = components.map(
        (c: any) => new mongoose.Types.ObjectId(c.productId),
      );

      const validProductCount = await Product.countDocuments({
        _id: { $in: componentIds },
        isCombo: false,
      }).session(session);

      if (validProductCount !== components.length) {
        throw new ErrorResponse("Vật phẩm con không hợp lệ", 400);
      }

      const processedUnits = units.map((u: any) => ({
        unitName: u.unitName.trim().toLowerCase(),
        exchangeValue: Number(u.exchangeValue),
        priceDefault: Number(u.priceDefault || 0),
        tax: Number(u.tax || 0),
        isDefault: Boolean(u.isDefault || u.isDefalut),
      }));

      const baseUnitName = baseUnit.trim().toLowerCase();
      const baseUnitInList = processedUnits.find(
        (u: any) => u.unitName === baseUnitName && u.exchangeValue === 1,
      );

      if (!baseUnitInList) {
        throw new ErrorResponse(
          `Đơn vị cơ bản [${baseUnitName}] phải có trong danh sách đơn vị với giá trị quy đổi là 1`,
          400,
        );
      }

      const defaultUnits = processedUnits.filter((u: any) => u.isDefault);
      if (defaultUnits.length > 1) {
        throw new ErrorResponse("Phải chọn đúng 1 đơn vị mặc định", 400);
      }
      if (defaultUnits.length === 0) {
        processedUnits.find(
          (u: any) => u.unitName === baseUnitName,
        )!.isDefault = true;
      }

      product.name = name.trim();
      product.sku = normalizedSku;
      product.category = category;
      product.baseUnit = baseUnitName;
      product.isSale = isSale ?? product.isSale;

      // Ghi đè hoàn toàn mảng components và units mới
      product.components = components;
      product.units = processedUnits;

      if (userId) {
        product.updatedBy = userId as mongoose.Types.ObjectId;
      }

      await product.save({ session });
      await session.commitTransaction();
      res.status(200).json({
        success: true,
        message: "Update combo product successfully",
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

export const deleteSaleProduct = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { productId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new ErrorResponse("Không tìm thấy sản phẩm", 404);
      }

      await Product.findByIdAndDelete(productId, { session });

      await session.commitTransaction();
      res.status(200).json({
        success: true,
        message: "Đã xóa sản phẩm thành công",
      });
    } catch (error: any) {
      await session.abortTransaction();
      throw new ErrorResponse(error.message, error.statusCode || 500);
    } finally {
      session.endSession();
    }
  },
);
