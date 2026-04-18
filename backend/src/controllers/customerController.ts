import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import Customer from "../models/Customer.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";

export const createCustomer = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { name, taxCode, phoneNumber, addresses, saleReps } = req.body;
    const userId = req.user?._id;

    const existingCustomer = await Customer.findOne({
      $or: [
        { phoneNumber },
        {
          taxCode: taxCode && taxCode !== "" ? taxCode : "NOT_EXISTS",
        },
      ],
    });

    if (existingCustomer) {
      throw new ErrorResponse(
        "Khách hàng với số điện thoại hoặc MST này đã tồn tại",
        400,
      );
    }

    let finalSaleReps: string[] = [];

    if (Array.isArray(saleReps) && saleReps.length > 0) {
      finalSaleReps = [...new Set(saleReps)];
    } else {
      throw new ErrorResponse(
        "Vui lòng chỉ định ít nhất một nhân viên phụ trách",
        400,
      );
    }

    const newCustomer = await Customer.create({
      name: name.trim(),
      taxCode: taxCode || undefined,
      phoneNumber: phoneNumber.trim(),
      addresses: addresses,
      saleReps: finalSaleReps,
      createdBy: userId,
      updatedBy: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Create new customer successfully",
      data: newCustomer,
    });
  },
);

export const getAllCustomer = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req);

    const [customers, totalItems] = await Promise.all([
      Customer.find()
        .skip(skip)
        .limit(limit)
        .populate("saleReps", "displayName")
        .populate("addresses.routeId", "routeName")
        .sort({ createdAt: -1 }),
      Customer.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(customers, totalItems, page, limit),
    });
  },
);

export const updateCustomer = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { customerId } = req.params;
    const userId = req.user?._id;

    if (req.body.saleReps) {
      if (!Array.isArray(req.body.saleReps)) {
        throw new ErrorResponse(
          "Danh sách nhân viên phụ trách phải là một mảng",
          400,
        );
      }
      req.body.saleReps = [...new Set(req.body.saleReps)];
    }

    const updateCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { ...req.body, updatedBy: userId },
      { new: true, runValidators: true },
    ).populate("saleReps", "displayName");

    if (!updateCustomer)
      throw new ErrorResponse("Không tìm thấy khách hàng", 404);
    res.status(200).json({ success: true, data: updateCustomer });
  },
);

export const deleteCustomer = asyncWrapper(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;

    const deletedCustomer = await Customer.findByIdAndDelete(customerId, {
      new: true,
      runValidators: true,
    });

    if (!deletedCustomer) {
      throw new ErrorResponse(
        "Khách hàng không tồn tại hoặc đã bị xóa trước đó",
        404,
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Delete customer successfully" });
  },
);
