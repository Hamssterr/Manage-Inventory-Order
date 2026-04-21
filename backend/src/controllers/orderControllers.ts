import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import Customer from "../models/Customer.js";
import mongoose from "mongoose";
import StockService from "../services/StockService.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import OrderService from "../services/OrderService.js";
import Order from "../models/Order.js";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";
import { getDateRangeQuery } from "../utils/queryHelper.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";

export const createOrder = asyncWrapper(async (req: Request, res: Response) => {
  const { customerId, items, note, saleId } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new ErrorResponse("Customer not found", 404);
  }

  const orderCode = OrderService.generateOrderCode();

  const fullAddress = `${customer?.addresses?.addressDetail}, ${customer?.addresses?.ward}, ${customer?.addresses?.district}, ${customer?.addresses?.province}`;
  const routeId = customer?.addresses?.routeId;

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

export const createGuestOrder = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { guestName, guestPhone, guestAddress, guestTaxCode, items, note } =
      req.body;
    const userId = req.user?._id;

    if (!guestName || !guestPhone || !guestAddress) {
      throw new ErrorResponse(
        "Please provide guest name, phone and address",
        400,
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orderCode = OrderService.generateOrderCode();
      const { processedItems, totalAmount } =
        await OrderService.processOrderItems(items);

      const stockUpdates: { productId: any; quantity: number }[] = [];

      for (const pItem of processedItems) {
        (pItem as any).deliveredQuantity = pItem.quantity;
        stockUpdates.push({
          productId: pItem.productId,
          quantity: -pItem.quantity,
        });
      }

      if (stockUpdates.length > 0) {
        await StockService.bulkUpdateStock(
          stockUpdates,
          "EXPORT",
          `Bán lẻ vãng lai mã ${orderCode}`,
          userId,
          session,
        );
      }

      const [newOrder] = await Order.create(
        [
          {
            orderCode,
            saleId: userId,
            customerNameSnapshot: guestName,
            customerPhoneSnapshot: guestPhone,
            deliveryAddressSnapshot: guestAddress,
            customerTaxCodeSnapshot: guestTaxCode,
            items: processedItems,
            totalAmount,
            note,
            status: "completed",
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: "Guest order created successfully",
        data: newOrder,
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorResponse(
        error.message || "Failed to create guest order",
        500,
      );
    }
  },
);

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

export const reconcileOrder = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { status, items } = req.body;
    const userId = req.user?._id;

    if (!["delivered", "cancelled"].includes(status)) {
      throw new ErrorResponse("Invalid status for reconciliation", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new ErrorResponse("Order not found", 404);
      }

      if (order.status !== "shipping") {
        throw new ErrorResponse("Order is not in shipping status", 400);
      }

      // Case 1: Hủy toàn bộ đơn hàng
      if (status === "cancelled") {
        order.status = "cancelled";
        order.note = order.note ? `${order.note} - Đã hủy` : "Đã hủy";
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
          success: true,
          message: "Order cancelled successfully",
          data: order,
        });
      }

      // Case 2: Giao hàng một phần
      let newAmountTotal = 0;
      const stockUpdates: { productId: any; quantity: number }[] = [];

      for (const orderItem of order.items) {
        let finalDeliveredQty = orderItem.quantity;

        // Nếu có truyền lên lấy 1 phần
        if (items && Array.isArray(items)) {
          const adjustedItem = items.find(
            (i: any) => i._id.toString() === orderItem._id.toString(),
          );
          if (adjustedItem && adjustedItem.deliveredQuantity !== undefined) {
            finalDeliveredQty = adjustedItem.deliveredQuantity;
          }
        }

        orderItem.deliveredQuantity = finalDeliveredQty;
        orderItem.subTotal = finalDeliveredQty * orderItem.priceUnit;
        newAmountTotal += orderItem.subTotal;

        if (finalDeliveredQty > 0) {
          stockUpdates.push({
            productId: orderItem.productId,
            quantity: -finalDeliveredQty,
          });
        }
      }

      if (stockUpdates.length > 0) {
        await StockService.bulkUpdateStock(
          stockUpdates,
          "EXPORT",
          `Giao thành công đơn ${order.orderCode}`,
          userId,
          session,
        );
      }

      order.status = "delivered";
      order.totalAmount = newAmountTotal;
      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Order reconciled successfully",
        data: order,
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorResponse(
        error.message || "Failed to reconcile order",
        500,
      );
    }
  },
);

export const rollbackOrderToShipping = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const userId = req.user?._id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order || order.status !== "delivered") {
        throw new ErrorResponse(
          "Only rollback delivered order to shipping",
          400,
        );
      }

      const stockUpdates: { productId: any; quantity: number }[] = [];
      for (const item of order.items) {
        if (item.deliveredQuantity && item.deliveredQuantity > 0) {
          stockUpdates.push({
            productId: item.productId,
            quantity: item.deliveredQuantity,
          });
        }
        item.deliveredQuantity = undefined;
      }

      if (stockUpdates.length > 0) {
        await StockService.bulkUpdateStock(
          stockUpdates,
          "ADJUST",
          `Hoàn tác đơn hàng ${order.orderCode}`,
          userId,
          session,
        );
      }

      order.status = "shipping";
      await order.save({ session });

      await session.commitTransaction();
      res.status(200).json({ success: true, message: "Rollback succesfully" });
    } catch (error: any) {
      await session.abortTransaction();
      throw new ErrorResponse(error.message, 500);
    } finally {
      session.endSession();
    }
  },
);

export const updateOrderStatus = asyncWrapper(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipping",
      "delivered",
      "cancelled",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      throw new ErrorResponse("Status invalid", 400);
    }

    const updateQuery: any = { $set: { status } };

    if (status === "pending" || status === "cancelled") {
      updateQuery.$unset = { exportTicketId: 1 };
    }

    const updatedStatus = await Order.findByIdAndUpdate(orderId, updateQuery, {
      new: true,
      runValidators: true,
    });

    if (!updatedStatus) {
      throw new ErrorResponse("Order not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: updatedStatus,
    });
  },
);

export const bulkReconcileOrders = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderIds, status } = req.body;
    const userId = req.user?._id;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ErrorResponse("Chưa chọn đơn hàng nào", 400);
    }
    if (!["delivered", "cancelled"].includes(status)) {
      throw new ErrorResponse("Status hợp lệ là delivered hoặc cancelled", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const orders = await Order.find({ _id: { $in: orderIds } }).session(
        session,
      );
      if (orders.length !== orderIds.length) {
        throw new ErrorResponse("Một số đơn hàng không tồn tại", 404);
      }

      const stockUpdates: { productId: any; quantity: number }[] = [];
      const orderCodes: string[] = [];

      for (const order of orders) {
        if (order.status !== "shipping") {
          throw new ErrorResponse(
            `Đơn ${order.orderCode} chưa ở trạng thái shipping`,
            400,
          );
        }

        if (status === "cancelled") {
          order.status = "cancelled";
          order.note = order.note
            ? `${order.note} - Đã hủy loạt`
            : "Đã hủy loạt";
        } else {
          let newAmountTotal = 0;
          for (const orderItem of order.items) {
            const finalDeliveredQty = orderItem.quantity;
            orderItem.deliveredQuantity = finalDeliveredQty;
            orderItem.subTotal = finalDeliveredQty * orderItem.priceUnit;
            newAmountTotal += orderItem.subTotal;

            if (finalDeliveredQty > 0) {
              stockUpdates.push({
                productId: orderItem.productId,
                quantity: -finalDeliveredQty,
              });
            }
          }
          order.status = "delivered";
          order.totalAmount = newAmountTotal;
        }

        orderCodes.push(order.orderCode);
        await order.save({ session });
      }

      if (status === "delivered" && stockUpdates.length > 0) {
        await StockService.bulkUpdateStock(
          stockUpdates,
          "EXPORT",
          `Giao thành công loạt đơn ${orderCodes.join(", ")}`,
          userId,
          session,
        );
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: `Đã đối soát loạt ${orderIds.length} đơn hàng thành công`,
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorResponse(error.message || "Failed to bulk reconcile", 500);
    }
  },
);
