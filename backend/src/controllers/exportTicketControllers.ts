import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import ExportTicket from "../models/ExportTicket.js";
import OrderService from "../services/OrderService.js";
import { getDateRangeQuery } from "../utils/queryHelper.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";

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
      status: "confirmed",
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

    if (routeId) {
      query.routeId = routeId;
    }

    if (status) {
      query.status = status;
    }

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

export const getExportTicketRevenue = asyncWrapper(
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;

    const revenueSummary = await Order.aggregate([
      {
        $match: {
          exportTicketId: new mongoose.Types.ObjectId(ticketId as string),
          status: "delivered",
        },
      },
      {
        $group: {
          _id: "$exportTicketId",
          totalRevenue: { $sum: "$totalAmount" },
          numberOfDeliveredOrders: { $sum: 1 },
        },
      },
    ]);

    const summary = revenueSummary[0] || {
      totalRevenue: 0,
      numberOfDeliveredOrders: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        ticketId,
        numberOfDeliveredOrders: summary.numberOfDeliveredOrders,
        totalRevenue: summary.totalRevenue,
      },
    });
  },
);

export const deleteExportTicket = asyncWrapper(
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;

    const ticket = await ExportTicket.findById(ticketId);
    if (!ticket) {
      throw new ErrorResponse("Không tìm thấy phiếu xuất kho", 404);
    }

    if (ticket.status === "completed") {
      throw new ErrorResponse(
        "Phiếu đã hoàn thành giao hàng, không thể huỷ",
        400,
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Order.updateMany(
        { _id: { $in: ticket.orderIds } },
        { $set: { status: "pending" }, $unset: { exportTicketId: 1 } },
        { session },
      );

      await ExportTicket.findByIdAndDelete(ticketId, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message:
          "Đã huỷ phiếu xuất và trả các đơn hàng về trạng thái Chờ xử lý",
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorResponse(error.message || "Huỷ phiếu thất bại", 500);
    }
  },
);
