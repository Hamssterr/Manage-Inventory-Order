import { asyncWrapper } from "../utils/asyncWrapper.js";
import User from "../models/User.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import { mailService } from "../services/mailService.js";
import crypto from "crypto";

export const getSalersList = asyncWrapper(
  async (req: Request, res: Response) => {
    const users = await User.find({ role: "salers" })
      .select("_id displayName phoneNumber role")
      .lean();

    res.status(200).json({
      success: true,
      data: users,
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
    data: {
      _id: newUser._id,
      phoneNumber: newUser.phoneNumber,
      displayName: newUser.displayName,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

export const resetUserPassword = asyncWrapper(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
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
