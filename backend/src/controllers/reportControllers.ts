import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import { format } from "node:path";
import { date } from "zod";
import { calculateTrend } from "../utils/mathHelper.js";
import { buildChartConfig, fillChartDataGaps } from "../utils/dateHelper.js";

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

export const getDashboardStats = asyncWrapper(
  async (req: Request, res: Response) => {
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

    // 1. Get current month stats
    const [currentMonthOrderStats, currentMonthNewCustomers] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              status: { $in: ["delivered", "completed"] },
              createdAt: { $gte: startOfCurrentMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Customer.countDocuments({ createdAt: { $gte: startOfCurrentMonth } }),
      ]);

    // 2. Get previous month stats
    const [prevMonthOrderStats, prevMonthNewCustomers] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            status: { $in: ["delivered", "completed"] },
            createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      Customer.countDocuments({
        createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      }),
    ]);

    const current = {
      revenue: currentMonthOrderStats[0]?.totalRevenue || 0,
      orders: currentMonthOrderStats[0]?.totalOrders || 0,
      customers: currentMonthNewCustomers,
    };

    const prev = {
      revenue: prevMonthOrderStats[0]?.totalRevenue || 0,
      orders: prevMonthOrderStats[0]?.totalOrders || 0,
      customers: prevMonthNewCustomers,
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
  async (req: Request, res: Response) => {
    const config = buildChartConfig(req.query.filter);

    const matchCondition = {
      status: { $in: ["delivered", "completed"] },
      createdAt: { $gte: config.startDate, $lte: config.endDate },
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
