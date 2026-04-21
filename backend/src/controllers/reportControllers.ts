import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import Order from "../models/Order.js";

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
