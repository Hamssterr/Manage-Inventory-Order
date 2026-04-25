import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import ExportTicket from "../models/ExportTicket.js";
import OrderService from "../services/OrderService.js";
import { getDateRangeQuery } from "../utils/queryHelper.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";
import Product from "../models/Product.js";
import { WAREHOUSE_SORT_ORDER } from "../config/warehouse.js";

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
    const { orderIds } = req.body;
    const userId = req.user?._id;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ErrorResponse("Please select at least 1 order", 400);
    }

    const objectIds = orderIds.map((id) => new mongoose.Types.ObjectId(id));

    // 1. Fetch chi tiết các đơn hàng để kiểm tra status và routeId
    const orders = await Order.find({
      _id: { $in: objectIds },
      status: "confirmed",
      exportTicketId: { $exists: false },
    });

    if (orders.length !== orderIds.length) {
      throw new ErrorResponse(
        "Một số đơn hàng không hợp lệ, phải ở trạng thái confirmed và chưa có phiếu xuất",
        400,
      );
    }

    // 2. Kiểm tra tính đồng nhất của tuyến đường (routeId)
    const routeIds = [...new Set(orders.map((o) => o.routeId?.toString()))];

    if (routeIds.length > 1) {
      throw new ErrorResponse(
        "Các đơn hàng được chọn phải cùng thuộc một tuyến đường",
        400,
      );
    }

    if (routeIds.length === 0 || !routeIds[0]) {
      throw new ErrorResponse(
        "Không tìm thấy thông tin tuyến đường trong các đơn hàng đã chọn",
        400,
      );
    }

    const commonRouteId = routeIds[0];

    const finalItems = await OrderService.getExportTicketItems(objectIds);

    const ticketCode = OrderService.generateExportTicketCode();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [newTicket] = await ExportTicket.create(
        [
          {
            ticketCode: ticketCode,
            routeId: new mongoose.Types.ObjectId(commonRouteId),
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
    const { page, limit, skip } = getPaginationParams(req);
    const { routeId, startDate, endDate, status, search } = req.query;

    const query: any = {};

    if (search) {
      query.ticketCode = { $regex: search, $options: "i" };
    }

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

    const [tickets, totalItems] = await Promise.all([
      ExportTicket.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("routeId", "routeName")
        .populate("createdBy", "displayName"),
      ExportTicket.countDocuments(query),
    ]);

    const response = formatPaginationResponse(tickets, totalItems, page, limit);

    res.status(200).json({
      success: true,
      message: "Get export tickets successfully",
      ...response,
    });
  },
);

export const getExportTicketDetail = asyncWrapper(
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;

    const ticket = await ExportTicket.findById(ticketId)
      .populate("routeId", "routeName")
      .populate("createdBy", "displayName")
      .lean();

    if (!ticket) {
      throw new ErrorResponse("Không tìm thấy phiếu xuất kho", 404);
    }

    const allProducts = await Product.find({
      isSale: true,
      isCombo: { $ne: true },
    })
      .select("_id name sku category baseUnit units isCombo components")
      .populate("components.productId", "name sku")
      .lean();

    allProducts.sort((a, b) => {
      let indexA = WAREHOUSE_SORT_ORDER.indexOf(a.name); // Hoặc a.sku tùy bạn muốn sort theo gì
      let indexB = WAREHOUSE_SORT_ORDER.indexOf(b.name);

      if (indexA === -1) indexA = 999999;
      if (indexB === -1) indexB = 999999;

      return indexA - indexB;
    });

    // Gom dữ liệu items từ phiếu xuất để dễ tra cứu
    const ticketItemsMap = new Map();
    if (ticket.aggregatedItems) {
      ticket.aggregatedItems.forEach((item: any) => {
        ticketItemsMap.set(item.productId.toString(), item);
      });
    }

    const loadSheetItems = allProducts.map((product) => {
      const itemInTicket = ticketItemsMap.get(product._id.toString());

      // Lấy đơn vị tính mặc định nếu không có trong phiếu
      const defaultUnit =
        product.units?.find((u: any) => u.isDefault)?.unitName ||
        product.baseUnit;

      return {
        _id: product._id,
        productId: product._id,
        sku: product.sku,
        productName: product.name,
        unitName: itemInTicket ? itemInTicket.unitName : defaultUnit,

        // Nếu có trong phiếu thì lấy số lượng thực tế, không có thì trả về 0
        totalQuantity: itemInTicket ? itemInTicket.totalQuantity : 0,
        displayQuantity: itemInTicket ? itemInTicket.displayQuantity : "0",

        // Thông tin phân loại
        isCombo: product.isCombo,
        category: product.category,
        isInTicket: !!itemInTicket, // Gợi ý cho FE biết sản phẩm này có thực sự nằm trong phiếu không
      };
    });

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết phiếu xuất thành công",
      data: {
        _id: ticket._id,
        ticketCode: ticket.ticketCode,
        routeName:
          typeof ticket.routeId === "object"
            ? (ticket.routeId as any).routeName
            : "",
        loadSheetItems: loadSheetItems,
      },
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
