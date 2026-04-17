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
    const { name, taxCode, phoneNumber, addresses, saleRep } = req.body;
    const userId = req.user?._id;

    const existingCustomer = await Customer.findOne({
      $or: [{ phoneNumber }, { taxCode: taxCode || "NOT_PROVIDED" }],
    });

    if (existingCustomer) {
      throw new ErrorResponse("Customer already exists", 400);
    }

    const newCustomer = await Customer.create({
      name: name.trim(),
      taxCode: taxCode || "NOT_PROVIDED",
      phoneNumber: phoneNumber.trim(),
      addresses: addresses,
      saleRep: saleRep || undefined,
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
        .populate("saleRep", "displayName")
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
    const updateCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { ...req.body, updatedBy: userId },
      { new: true, runValidators: true },
    );

    if (!updateCustomer) throw new ErrorResponse("Customer not found", 404);
    res.status(200).json({ success: true, data: updateCustomer });
  },
);

export const deleteCustomer = asyncWrapper(
  async (req: Request, res: Response) => {
    const { customerId } = req.params;

    await Customer.findByIdAndDelete(customerId, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({ success: true, message: "Delete customer successfully" });
  },
);
