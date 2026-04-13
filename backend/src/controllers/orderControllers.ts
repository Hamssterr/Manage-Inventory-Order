import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import Customer from "../models/Customer.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import OrderService from "../services/OrderService.js";
import ProductService from "../services/ProductService.js";
import Order from "../models/Order.js";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";
import { getDateRangeQuery } from "../utils/queryHelper.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import mongoose from "mongoose";

export const createOrder = asyncWrapper(async (req: Request, res: Response) => {
  const { customerId, items, note } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new ErrorResponse("Customer not found", 404);
  }

  const orderCode = OrderService.generateOrderCode();

  const saleId = customer.saleRep._id;

  const address = customer.addresses.find(
    (a) => a.isDefalut || customer.addresses[0],
  );
  const fullAddress = `${address?.addressDetail}, ${address?.ward}, ${address?.district}, ${address?.province}`;
  const routeId = address?.routeId;

  const { processedItems, totalAmount } =
    await OrderService.processOrderItems(items);

  const newOrder = await Order.create({
    orderCode,
    customerId: customerId,
    saleId: saleId,
    customerNameSnapshot: customer.name,
    customerPhoneSnapshot: customer.phoneNumber,
    deliveryAddressSnapshot: fullAddress,
    routeId: routeId,
    customerTaxCodeSnapshot: customer.taxCode,
    items: processedItems,
    totalAmount,
    note,
    status: "pending",
  });

  res.status(200).json({
    success: true,
    message: "Create new order successfully",
    data: newOrder,
  });
});

export const getAllOrders = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req);
    const { status, startDate, endDate, orderCode, customerId, routeId } =
      req.query;

    const query: any = {};

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (routeId) query.routeId = routeId;
    if (orderCode) query.orderCode = { $regex: orderCode, $options: "i" };

    const dateQuery = getDateRangeQuery(startDate as string, endDate as string);
    if (Object.keys(dateQuery).length > 0) {
      query.createdAt = dateQuery;
    }

    const [orders, totalItems] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 }) // Đơn hàng mới nhất lên đầu
        .skip(skip)
        .limit(limit)
        .populate("saleId", "displayName"),
      Order.countDocuments(query),
    ]);

    const response = formatPaginationResponse(orders, totalItems, page, limit);

    res.status(200).json({
      success: true,
      message: "Get all orders successfully",
      ...response,
    });
  },
);

export const getDetailOrder = asyncWrapper(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate(
      "saleId",
      "displayName",
    );

    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Get order detail successfully",
      data: order,
    });
  },
);

export const updateOrder = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { items, note, status } = req.body;
    const userId = req.user?._id;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    if (order.status !== "pending") {
      throw new ErrorResponse("Order is not in pending status", 400);
    }

    const updateData: any = {
      note,
      status,
      updatedBy: userId,
    };

    if (items && items.length > 0) {
      const { processedItems, totalAmount } =
        await OrderService.processOrderItems(items);
      updateData.items = processedItems;
      updateData.totalAmount = totalAmount;
    } else if (items && items.length === 0) {
      throw new ErrorResponse("Order must have at least one item", 400);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Update order successfully",
      data: updatedOrder,
    });
  },
);

export const deleteOrder = asyncWrapper(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findByIdAndDelete(orderId);

  if (!order) {
    throw new ErrorResponse("Order not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Delete order successfully",
  });
});


