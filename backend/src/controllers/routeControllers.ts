import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import Route from "../models/Route.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";
import Customer from "../models/Customer.js";

export const createRoute = asyncWrapper(async (req: Request, res: Response) => {
  const { routeName, description, responsibleSale } = req.body;

  const existingRoute = await Route.findOne({ routeName });
  if (existingRoute) {
    throw new ErrorResponse("Tên tuyến đường đã tồn tại", 400);
  }

  if (!Array.isArray(responsibleSale) || responsibleSale.length === 0) {
    throw new ErrorResponse(
      "Vui lòng chỉ định ít nhất một nhân viên tiếp thị",
      400,
    );
  }

  const uniqueSales = [...new Set(responsibleSale)];

  const route = await Route.create({
    routeName,
    description,
    responsibleSale: uniqueSales,
  });
  res.status(201).json({
    success: true,
    message: "Tuyến đường mới đã được tạo với danh sách tiếp thị",
    data: route,
  });
});

export const getRouteList = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req);
    const { search, saleId } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      query.$or = [{ routeName: searchRegex }, { description: searchRegex }];
    }

    if (saleId) {
      query.responsibleSale = saleId;
    }

    const [routes, totalItems] = await Promise.all([
      Route.find(query)
        .skip(skip)
        .limit(limit)
        .populate("responsibleSale", "displayName phoneNumber")
        .sort({ createdAt: -1 }),
      Route.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(routes, totalItems, page, limit),
    });
  },
);

export const updateRoute = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { responsibleSale, ...otherData } = req.body;

  if (responsibleSale) {
    if (!Array.isArray(responsibleSale)) {
      throw new ErrorResponse(
        "Vui lòng cung cấp danh sách nhân viên tiếp thị hợp lệ",
        400,
      );
    }
    req.body.responsibleSale = [...new Set(responsibleSale)];
  }

  const updatedRoute = await Route.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("responsibleSale", "displayName phoneNumber");

  if (!updatedRoute) {
    throw new ErrorResponse("Không tìm thấy tuyến đường", 404);
  }

  res.status(200).json({
    success: true,
    message: "Cập nhật tuyến đường thành công",
    data: updatedRoute,
  });
});

export const deleteRoute = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;

  const route = await Route.findById(id);
  if (!route) {
    throw new ErrorResponse("Tuyến đường không tồn tại", 404);
  }

  const customerRouteCount = await Customer.countDocuments({
    "addresses.routeId": id,
  });
  if (customerRouteCount > 0) {
    throw new ErrorResponse(
      `Không thể xóa! Hiện đang có ${customerRouteCount} khách hàng thuộc tuyến đường này.`,
      400,
    );
  }

  await Route.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Route has been deleted",
  });
});
