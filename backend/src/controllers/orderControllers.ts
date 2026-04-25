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
import { IProduct } from "../models/Product.js";

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
    const {
      status,
      startDate,
      endDate,
      orderCode,
      customerId,
      routeId,
      search,
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (routeId) query.routeId = routeId;
    if (orderCode) query.orderCode = { $regex: orderCode, $options: "i" };

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { customerNameSnapshot: searchRegex },
        { customerPhoneSnapshot: searchRegex },
      ];
    }

    const dateQuery = getDateRangeQuery(startDate as string, endDate as string);
    if (Object.keys(dateQuery).length > 0) {
      query.createdAt = dateQuery;
    }

    const [orders, totalItems] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 }) // Đơn hàng mới nhất lên đầu
        .skip(skip)
        .limit(limit)
        .populate("saleId", "displayName")
        .populate("routeId", "routeName"),
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
    ).populate("routeId", "routeName");

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
    const { customerId, saleId, note, items } = req.body;
    const userId = req.user?._id;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      throw new ErrorResponse(
        "Chỉ có thể cập nhật đơn hàng ở trạng thái chờ hoặc xác nhận",
        400,
      );
    }

    const updateData: any = {
      note,
      updatedBy: userId,
    };

    // 1. Cập nhật Khách hàng & Snapshots (Giống createOrder)
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new ErrorResponse("Customer not found", 404);
      }

      const fullAddress = `${customer?.addresses?.addressDetail}, ${customer?.addresses?.ward}, ${customer?.addresses?.district}, ${customer?.addresses?.province}`;

      updateData.customerId = customerId;
      updateData.customerNameSnapshot = customer.name;
      updateData.customerPhoneSnapshot = customer.phoneNumber;
      updateData.deliveryAddressSnapshot = fullAddress;
      updateData.customerTaxCodeSnapshot = customer.taxCode;
      updateData.routeId = customer?.addresses?.routeId;
    }

    // 2. Cập nhật Nhân viên
    if (saleId) updateData.saleId = saleId;

    // 3. Cập nhật Sản phẩm & Tính toán lại tiền
    if (items && items.length > 0) {
      const { processedItems, totalAmount } =
        await OrderService.processOrderItems(items);
      updateData.items = processedItems;
      updateData.totalAmount = totalAmount;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    ).populate("saleId", "displayName");

    res.status(200).json({
      success: true,
      message: "Update order successfully",
      data: updatedOrder,
    });
  },
);

export const deleteOrder = asyncWrapper(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ErrorResponse("Order not found", 404);
  }

  if (["delivered", "completed"].includes(order.status)) {
    throw new ErrorResponse(`Không thể xóa đơn hàng đã hoàn thành`, 400);
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
    message: "Delete order successfully",
  });
});

// Confirm đơn hàng ở pending -> confirmed
export const updateOrderStatus = asyncWrapper(
  async (req: Request, res: Response) => {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ErrorResponse("Vui lòng chọn ít nhất 1 đơn hàng", 400);
    }

    const orders = await Order.find({ _id: { $in: orderIds } });
    if (orders.length !== orderIds.length) {
      throw new ErrorResponse(
        "Một số đơn hàng không tồn tại trên hệ thống. Vui lòng tải lại trang.",
        404,
      );
    }

    const invalidOrders = orders
      .filter((order) => order.status !== "pending")
      .map((order) => ({
        orderCode: order.orderCode,
        currentStatus: order.status,
      }));
    if (invalidOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Có ${invalidOrders.length} đơn hàng không hợp lệ.`,
        errors: invalidOrders,
      });
    }

    await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: { status: "confirmed" } },
    );

    res.status(200).json({
      success: true,
      message: `Đã xác nhận thành công tất cả ${orderIds.length} đơn hàng.`,
    });
  },
);

// Hủy đơn hàng ở trạng thái pending hoặc confirmed
export const cancelOrders = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderIds, cancelNote } = req.body;
    const userId = req.user?._id;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ErrorResponse("Vui lòng chọn ít nhất 1 đơn hàng để hủy", 400);
    }

    const orders = await Order.find({ _id: { $in: orderIds } });
    if (orders.length !== orderIds.length) {
      throw new ErrorResponse(
        "Một số đơn hàng không tồn tại trên hệ thống. Vui lòng tải lại trang.",
        404,
      );
    }

    const bannedStatus = ["shipping", "delivered", "completed", "cancelled"];
    const validOrders = orders
      .filter((order) => bannedStatus.includes(order.status))
      .map((order) => ({
        orderCode: order.orderCode,
        currentStatus: order.status,
      }));

    if (validOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy. Có ${validOrders.length} đơn hàng đã xuất kho hoặc hoàn thành.`,
        errors: validOrders,
      });
    }

    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        $set: {
          status: "cancelled",
          note: cancelNote ? `Lý do hủy: ${cancelNote}` : "Đã hủy bởi kiểm kho",
          updatedBy: userId,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: `Đã hủy thành công tất cả ${orderIds.length} đơn hàng.`,
    });
  },
);

// Đối xoát kho

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

export const bulkReconcileOrders = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderIds } = req.body;
    const userId = req.user?._id;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new ErrorResponse("Vui lòng chọn ít nhất 1 đơn hàng", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const orders = await Order.find({ _id: { $in: orderIds } }).session(
        session,
      );
      if (orders.length !== orderIds.length) {
        throw new ErrorResponse(
          "Một số đơn hàng không tồn tại trên hệ thống",
          404,
        );
      }

      const stockUpdates: { productId: any; quantity: number }[] = [];
      const orderCodes: string[] = [];

      for (const order of orders) {
        if (order.status !== "shipping") {
          throw new ErrorResponse(
            `Đơn hàng ${order.orderCode} chưa ở trạng thái đang giao (shipping)`,
            400,
          );
        }

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
        (order as any).updatedBy = userId;

        orderCodes.push(order.orderCode);
        await order.save({ session });
      }
      if (stockUpdates.length > 0) {
        await StockService.bulkUpdateStock(
          stockUpdates,
          "EXPORT",
          `Giao thành công loạt đơn: ${orderCodes.join(", ")}`,
          userId,
          session,
        );
      }

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: `Đã đối soát thành công ${orderIds.length} đơn hàng`,
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorResponse(error.message || "Lỗi đối soát hàng loạt", 500);
    }
  },
);

// Hủy đơn hàng duy nhất đang ở trạng thái shipping
export const cancelDeliveryOrder = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { cancelNote } = req.body;
    const userId = req.user?._id;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ErrorResponse("Order not found", 404);
    }

    if (order.status !== "shipping") {
      throw new ErrorResponse(
        "Chỉ có thể hủy đơn hàng đang giao (shipping)",
        400,
      );
    }

    order.status = "cancelled";
    order.note = cancelNote
      ? `${order.note ? order.note + "\n" : ""}Lý do hủy: ${cancelNote}`
      : `${order.note ? order.note + "\n" : ""}Đã hủy khi đang giao`;
    (order as any).updatedBy = userId;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Hủy giao hàng thành công",
    });
  },
);

// Giao hàng thành công (Có hỗ trợ thay đổi số lượng, loại đơn vị)
export const reconcileSingleOrder = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { items, note } = req.body;
    const userId = req.user?._id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new ErrorResponse("Order not found", 404);
      }

      if (order.status !== "shipping") {
        throw new ErrorResponse(
          "Chỉ có thể đối soát đơn hàng ở trạng thái đang giao (shipping)",
          400,
        );
      }

      // 1. Process new items if provided
      let finalItems = order.items;
      let finalTotalAmount = order.totalAmount;

      if (items && items.length > 0) {
        const { processedItems, totalAmount } =
          await OrderService.processOrderItems(items);
        finalItems = processedItems as any;
        finalTotalAmount = totalAmount;
      }

      // 2. Prepare stock updates
      const stockUpdates: { productId: any; quantity: number }[] = [];
      for (const item of finalItems) {
        // Track the quantity the customer actually kept
        (item as any).deliveredQuantity = item.quantity;

        // TÍNH TOÁN BASE QUANTITY ĐÚNG CHUẨN: quantity * exchangeValueSnapshot
        const baseExtractedQty = item.quantity * item.exchangeValueSnapshot;
        if (baseExtractedQty > 0) {
          stockUpdates.push({
            productId: item.productId,
            quantity: -baseExtractedQty,
          });
        }
      }

      // 3. Update order fields
      order.items = finalItems;
      order.totalAmount = finalTotalAmount;
      order.status = "delivered";
      if (note) {
        order.note = order.note ? `${order.note}\n${note}` : note;
      }
      (order as any).updatedBy = userId;

      // 4. Excute Stock Deduction
      if (stockUpdates.length > 0) {
        await StockService.bulkUpdateStock(
          stockUpdates,
          "EXPORT",
          `Giao thành công đơn hàng ${order.orderCode}`,
          userId,
          session,
        );
      }

      await order.save({ session });
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Giao hàng và đối soát thành công",
        data: order,
      });
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      throw new ErrorResponse(err.message || "Lỗi giao hàng", 500);
    }
  },
);
