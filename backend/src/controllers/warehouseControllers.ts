import { asyncWrapper } from "../utils/asyncWrapper.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import { Request, Response } from "express";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import ProductService from "../services/ProductService.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import ExportTicket from "../models/ExportTicket.js";
import OrderService from "../services/OrderService.js";
import { getDateRangeQuery } from "../utils/queryHelper.js";
import StockService from "../services/StockService.js";
import { success } from "zod";

export const previewExportTicketOrder = asyncWrapper(
  async (req: Request, res: Response) => {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ErrorResponse("Please choose at least 1 order", 400);
    }

    const objectIds = orderIds.map((id) => new mongoose.Types.ObjectId(id));

    const finalItems = await OrderService.getExportTicketItems(objectIds);

    res.status(200).json({
      success: true,
      message: "Preview export ticket order successfully",
      data: finalItems,
    });
  },
);

export const createExportTicket = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderIds, routeId } = req.body;
    const userId = req.user?._id;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ErrorResponse("Please select at least 1 order", 400);
    }
    if (!routeId) {
      throw new ErrorResponse("Route ID is required", 400);
    }

    const objectIds = orderIds.map((id) => new mongoose.Types.ObjectId(id));

    const validOrdersCount = await Order.countDocuments({
      _id: { $in: objectIds },
      status: "pending",
      exportTicketId: { $exists: false },
    });

    if (validOrdersCount !== orderIds.length) {
      throw new ErrorResponse(
        "Some orders are invalid or already have export tickets",
        400,
      );
    }

    const finalItems = await OrderService.getExportTicketItems(objectIds);

    const ticketCode = OrderService.generateExportTicketCode();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [newTicket] = await ExportTicket.create(
        [
          {
            ticketCode: ticketCode,
            routeId: new mongoose.Types.ObjectId(routeId as string),
            orderIds: objectIds,
            aggregatedItems: finalItems,
            status: "exported",
            createdBy: userId,
          },
        ],
        { session },
      );

      const createdTicketId = newTicket._id;

      await Order.updateMany(
        { _id: { $in: objectIds } },
        {
          $set: {
            status: "shipping",
            exportTicketId: createdTicketId,
          },
        },
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: "Export ticket created successfully",
        data: newTicket,
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorResponse(
        error.message || "Failed to create export ticket",
        500,
      );
    }
  },
);

export const getExportTickets = asyncWrapper(
  async (req: Request, res: Response) => {
    const { routeId, startDate, endDate, status } = req.query;

    const query: any = {};

    // 2. Lọc theo Tuyến đường
    if (routeId) {
      query.routeId = routeId;
    }

    // 3. Lọc theo Trạng thái (Tuỳ chọn thêm để dễ quản lý)
    if (status) {
      query.status = status;
    }

    // 4. Lọc theo Ngày tháng tạo phiếu
    const dateQuery = getDateRangeQuery(startDate as string, endDate as string);
    if (Object.keys(dateQuery).length > 0) {
      query.createdAt = dateQuery;
    }

    const tickets = await ExportTicket.find(query)
      .sort({ createdAt: -1 })
      .populate("routeId", "routeName")
      .populate("createdBy", "displayName");

    res.status(200).json({
      success: true,
      data: tickets,
    });
  },
);

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

        // Cập nhật số lượng giao thực tế
        orderItem.deliveredQuantity = finalDeliveredQty;
        orderItem.subTotal = finalDeliveredQty * orderItem.priceUnit;
        newAmountTotal += orderItem.subTotal;

        // Chuẩn bị cập nhật kho hàng loạt
        if (finalDeliveredQty > 0) {
          stockUpdates.push({
            productId: orderItem.productId,
            quantity: -finalDeliveredQty,
          });
        }
      }

      // THỰC HIỆN CẬP NHẬT KHO HÀNG LOẠT (Tối ưu hiệu năng)
      if (stockUpdates.length > 0) {
        await StockService.bulkUpdateStock(
          stockUpdates,
          "EXPORT",
          `Giao thành công đơn ${order.orderCode}`,
          userId,
          session,
        );
      }

      // Cập nhật lại Order
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

      // THỰC HIỆN CẬP NHẬT KHO HÀNG LOẠT (Tối ưu hiệu năng)
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
    ];
    if (!validStatuses.includes(status)) {
      throw new ErrorResponse("Status invalid", 400);
    }

    // Chuẩn bị query cập nhật
    const updateQuery: any = { $set: { status } };

    // Nếu quay về pending hoặc cancelled, xóa liên kết exportTicketId
    if (status === "pending" || status === "cancelled") {
      updateQuery.$unset = { exportTicketId: 1 };
    }

    const updatedStatus = await Order.findByIdAndUpdate(
      orderId,
      updateQuery,
      { new: true, runValidators: true },
    );

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
