import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import { calculateTrend } from "../utils/mathHelper.js";
import { buildChartConfig, fillChartDataGaps } from "../utils/dateHelper.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authMiddleware.js";

export const getGeneralSalesReport = asyncWrapper(
  async (req: Request, res: Response) => {
    const { groupBy = "day", startDate, endDate } = req.query;

    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") dateFormat = "%Y-%m";
    if (groupBy === "year") dateFormat = "%Y";

    const matchStage: any = {
      status: { $in: ["delivered", "completed"] },
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    const [revenueReport, itemsReport] = await Promise.all([
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),

      Order.aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: dateFormat, date: "$createdAt" },
              },
              productId: "$items.productId",
            },
            productName: { $first: "$items.productNameSnapshot" },
            totalQuantitySold: { $sum: "$items.deliveredQuantity" },
          },
        },
        { $sort: { "_id.date": -1, totalQuantitySold: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenue: revenueReport,
        itemsSold: itemsReport,
      },
    });
  },
);

export const getSalerRevenueReport = asyncWrapper(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const matchStage: any = {
      status: { $in: ["delivered", "completed"] },
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
    }

    const salerReport = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            saleId: "$saleId",
            month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            productId: "$items.productId",
          },
          productName: { $first: "$items.productNameSnapshot" },
          quantitySold: { $sum: "$items.deliveredQuantity" },
          revenueFromProduct: { $sum: "$items.subTotal" },
        },
      },
      {
        $group: {
          _id: { saleId: "$_id.saleId", month: "$_id.month" },
          totalSalesRevenue: { $sum: "$revenueFromProduct" },
          itemsSold: {
            $push: {
              productId: "$_id.productId",
              productName: "$productName",
              quantity: "$quantitySold",
              revenue: "$revenueFromProduct",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.saleId",
          foreignField: "_id",
          as: "saleInfo",
        },
      },
      { $unwind: "$saleInfo" },
      {
        $project: {
          _id: 0,
          saleId: "$_id.saleId",
          saleName: "$saleInfo.displayName",
          month: "$_id.month",
          totalSalesRevenue: 1,
          itemsSold: 1,
        },
      },
      { $sort: { month: -1, totalSalesRevenue: -1 } },
    ]);

    res.status(200).json({ success: true, data: salerReport });
  },
);

export const getSalerRevenueDataReport = asyncWrapper(
  async (req: Request, res: Response) => {
    const { saleId } = req.params;
    const { filter } = req.query;

    if (!saleId) {
      throw new ErrorResponse("Vui lòng chọn sale", 400);
    }

    const config = buildChartConfig(filter);
    const matchCondition = {
      status: { $in: ["delivered", "completed"] },
      createdAt: { $gte: config.startDate, $lte: config.endDate },
      saleId: new mongoose.Types.ObjectId(saleId as string),
    };

    const [chartResult, topProductsResult] = await Promise.all([
      Order.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: {
              $dateToString: {
                format: config.dateFormat,
                date: "$createdAt",
                timezone: "+07:00",
              },
            },
            revenue: { $sum: "$totalAmount" },
          },
        },
      ]),

      Order.aggregate([
        { $match: matchCondition },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.productNameSnapshot" },
            quantity: { $sum: "$items.deliveredQuantity" },
            revenue: { $sum: "$items.subTotal" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const finalChartData = fillChartDataGaps(chartResult, config);

    res.status(200).json({
      success: true,
      data: {
        chartData: finalChartData,
        topProducts: topProductsResult,
      },
    });
  },
);

export const getDashboardStats = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new ErrorResponse("Người dùng không xác định", 401);
    }

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const endOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const isRestricted = !["admin", "owner", "accountant"].includes(user.role);

    const getBaseFilters = (startDate: Date, endDate?: Date) => {
      const match: any = {
        status: { $in: ["delivered", "completed"] },
        createdAt: { $gte: startDate },
      };
      if (endDate) match.createdAt.$lte = endDate;

      if (isRestricted) match.saleId = user._id;
      return match;
    };

    const getCustomerFilters = (startDate: Date, endDate?: Date) => {
      const filters: any = {
        createdAt: { $gte: startDate },
      };
      if (endDate) filters.createdAt.$lte = endDate;
      if (isRestricted) filters.saleId = user._id;
      return filters;
    };

    const [currentStats, currentCustomers, prevStats, prevCustomers] =
      await Promise.all([
        Order.aggregate([
          { $match: getBaseFilters(startOfCurrentMonth) },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Customer.countDocuments(getCustomerFilters(startOfCurrentMonth)),
        Order.aggregate([
          { $match: getBaseFilters(startOfPreviousMonth, endOfPreviousMonth) },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Customer.countDocuments(
          getCustomerFilters(startOfPreviousMonth, endOfPreviousMonth),
        ),
      ]);

    const current = {
      revenue: currentStats[0]?.totalRevenue || 0,
      orders: currentStats[0]?.totalOrders || 0,
      customers: currentCustomers,
    };

    const prev = {
      revenue: prevStats[0]?.totalRevenue || 0,
      orders: prevStats[0]?.totalOrders || 0,
      customers: prevCustomers,
    };

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: current.revenue,
        revenueTrend: calculateTrend(current.revenue, prev.revenue),
        totalOrders: current.orders,
        ordersTrend: calculateTrend(current.orders, prev.orders),
        newCustomers: current.customers,
        customersTrend: calculateTrend(current.customers, prev.customers),
      },
    });
  },
);

export const getChartData = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      throw new ErrorResponse("Người dùng không xác định", 401);
    }
    const config = buildChartConfig(req.query.filter);

    const isRestricted = !["admin", "owner", "accountant"].includes(user.role);

    const matchCondition: any = {
      status: { $in: ["delivered", "completed"] },
      createdAt: { $gte: config.startDate, $lte: config.endDate },
    };

    if (isRestricted) {
      matchCondition.saleId = user._id;
    }

    const [chartResult, topProductsResult] = await Promise.all([
      Order.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: {
              $dateToString: {
                format: config.dateFormat,
                date: "$createdAt",
                timezone: "+07:00",
              },
            },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Order.aggregate([
        { $match: matchCondition },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.productNameSnapshot" },
            quantity: { $sum: "$items.deliveredQuantity" },
            revenue: { $sum: "$items.subTotal" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        chartData: fillChartDataGaps(chartResult, config),
        topProducts: topProductsResult,
      },
    });
  },
);

// Self report
export const getTopSellingProducts = asyncWrapper(
  async (req: AuthRequest, res: Response) => {
    // Dùng AuthRequest để lấy req.user
    const { month, year } = req.query;
    const user = req.user;

    const targetMonth = month
      ? parseInt(month as string) - 1
      : new Date().getMonth();
    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const matchCondition: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ["delivered", "completed"] },
    };

    if (!["admin", "owner", "accountant"].includes(user?.role || "")) {
      matchCondition.saleId = user?._id;
    }

    const stats = await Order.aggregate([
      { $match: matchCondition }, // Sử dụng matchCondition linh hoạt
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productNameSnapshot" },
          sku: { $first: "$items.skuSnapshot" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subTotal" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({ success: true, data: stats });
  },
);
