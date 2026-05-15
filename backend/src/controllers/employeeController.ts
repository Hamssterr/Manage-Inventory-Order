import { asyncWrapper } from "../utils/asyncWrapper.js";
import User from "../models/User.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import { mailService } from "../services/mailService.js";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";
import Order from "../models/Order.js";

export const getSalersList = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req);
    const { search } = req.query;

    const query: any = {};
    if (search) {
      query.$text = { $search: search as string };
    }

    const [users, totalItems] = await Promise.all([
      User.find({
        role: { $in: ["salers", "accountant"] },
      })
        .select("_id displayName email phoneNumber role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: { $in: ["salers", "accountant"] } }),
    ]);

    const response = formatPaginationResponse(users, totalItems, page, limit);

    res.status(200).json({
      success: true,
      message: "Get all employee successfully",
      ...response,
    });
  },
);

export const getAllUsers = asyncWrapper(async (req: Request, res: Response) => {
  const users = await User.find()
    .select("_id displayName phoneNumber role")
    .lean();

  res.status(200).json({
    success: true,
    data: users,
  });
});

export const createUser = asyncWrapper(async (req: Request, res: Response) => {
  const { phoneNumber, email, displayName, role } = req.body;

  if (!phoneNumber || !email || !displayName || !role) {
    throw new ErrorResponse("Vui lòng cung cấp đầy đủ thông tin", 400);
  }

  const cleanPhoneNumber = phoneNumber.trim();
  const cleanEmail = email.trim().toLowerCase();

  const duplicateData = await User.findOne({
    $or: [{ phoneNumber: cleanPhoneNumber }, { email: cleanEmail }],
  });

  if (duplicateData) {
    throw new ErrorResponse(
      duplicateData.phoneNumber === cleanPhoneNumber
        ? "Số điện thoại đã tồn tại"
        : "Email đã tồn tại",
      400,
    );
  }

  const randomPassword = crypto.randomBytes(4).toString("hex");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(randomPassword, salt);

  const newUser = await User.create({
    phoneNumber: cleanPhoneNumber,
    hashedPassword: hashedPassword,
    email: cleanEmail,
    displayName: displayName.trim(),
    role,
  });

  mailService
    .sendWelcomeEmail(cleanEmail, displayName.trim(), randomPassword)
    .catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
  res.status(201).json({
    success: true,
    message: "Tạo người dùng thành công",
  });
});

export const resetUserPassword = asyncWrapper(
  async (req: Request, res: Response) => {
    const { employeeId } = req.params;

    const user = await User.findById(employeeId);
    if (!user) {
      throw new ErrorResponse("Không tìm thấy người dùng", 404);
    }

    const newPassword = crypto.randomBytes(4).toString("hex");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.hashedPassword = hashedPassword;
    await user.save();

    mailService
      .sendResetPasswordEmail(user.email, user.displayName, newPassword)
      .catch((err) => {
        console.error("Failed to send reset password email:", err);
      });

    res.status(200).json({
      success: true,
      message: "Đã reset mật khẩu và gửi email thành công",
    });
  },
);

export const deleteUser = asyncWrapper(async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  const user = await User.findById(employeeId);
  if (!user) {
    throw new ErrorResponse("Không tìm thấy người dùng", 404);
  }

  await User.findByIdAndDelete(employeeId);

  res.status(200).json({
    success: true,
    message: "Xóa người dùng thành công",
  });
});

export const exportSalary = asyncWrapper(
  async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    const targetMonth = month
      ? parseInt(month as string) - 1
      : new Date().getMonth();
    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const [employee, exportSalary] = await Promise.all([
      User.findById(employeeId).select("displayName phoneNumber").lean(),
      Order.aggregate([
        {
          $match: {
            saleId: new mongoose.Types.ObjectId(employeeId as string),
            status: { $in: ["completed", "delivered"] },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: {
              productId: "$items.productId",
              unitName: "$items.unitNameSnapshot",
            },
            productName: { $first: "$items.productNameSnapshot" },
            unitName: { $first: "$items.unitNameSnapshot" },
            totalQuantity: { $sum: "$items.quantity" },
            totalSalary: {
              $sum: {
                $multiply: [
                  "$items.quantity",
                  { $ifNull: ["$items.salaryPerUnitSnapshot", 0] },
                ],
              },
            },
          },
        },
        { $sort: { totalSalary: -1 } },
      ]),
    ]);

    let grandTotalSalary = 0;
    let grandTotalProducts = 0;

    const formattedReport = exportSalary.map((item) => {
      grandTotalProducts += item.totalQuantity;
      grandTotalSalary += item.totalSalary;
      return {
        productId: item._id.productId,
        productName: item.productName,
        unitName: item.unitName,
        totalQuantity: item.totalQuantity,
        totalSalary: item.totalSalary,
        displayText: `${item.totalQuantity} ${item.unitName?.charAt(0).toUpperCase() + item.unitName?.slice(1)} ${item.productName}: ${item.totalSalary.toLocaleString("vi-VN")}đ`,
      };
    });

    res.status(200).json({
      success: true,
      message: "Lấy báo cáo lương thành công",
      data: {
        summary: {
          employeeName: employee?.displayName,
          employeePhone: employee?.phoneNumber,
          month: targetMonth + 1,
          year: targetYear,
          totalProductsSold: grandTotalProducts,
          totalSalaryEarned: grandTotalSalary,
        },
        details: formattedReport,
      },
    });
  },
);
