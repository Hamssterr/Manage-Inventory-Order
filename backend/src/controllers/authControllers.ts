import mongoose from "mongoose";
import User from "../models/User.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";
import { signupSchema, type UpdateUserDto } from "../libs/authValidate.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";

const ACCESS_TOKEN_TTL = "30d";
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000;

export const signup = asyncWrapper(async (req: Request, res: Response) => {
  const validation = signupSchema.safeParse({ body: req.body });

  if (!validation.success) {
    throw new ErrorResponse(validation.error.issues[0].message, 400);
  }

  const { phoneNumber, password, email, firstName, lastName } =
    validation.data.body;

  const cleanPhoneNumber = phoneNumber.trim();
  const cleanEmail = email.trim().toLowerCase();

  const duplicateData = await User.findOne({
    $or: [{ phoneNumber: cleanPhoneNumber }, { email: cleanEmail }],
  });

  if (duplicateData) {
    throw new ErrorResponse(
      duplicateData.phoneNumber === cleanPhoneNumber
        ? "PhoneNumber already exists"
        : "Email already exists",
      400,
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    phoneNumber: cleanPhoneNumber,
    hashedPassword,
    email: cleanEmail,
    displayName: `${firstName.trim()} ${lastName.trim()}`,
  });

  res.status(201).json({
    message: "User created successfully",
    user: {
      _id: newUser._id,
      phoneNumber: newUser.phoneNumber,
      displayName: newUser.displayName,
      email: newUser.email,
    },
  });
});

export const signin = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      throw new ErrorResponse("Missing PhoneNumber and Password", 400);
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      throw new ErrorResponse("Phonenumber or password incorrect", 401);
    }

    const correctPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!correctPassword) {
      throw new ErrorResponse("Password incorrect", 401);
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshToken = crypto.randomBytes(64).toString("hex");

    await Session.create({
      userId: user._id,
      refreshToken,
      expiredAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    res.status(201).json({
      message: `User: ${user.displayName} has logged in`,
      accessToken,
    });
  },
);

export const refreshToken = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const currentRefreshToken = req.cookies?.refreshToken;

    if (!currentRefreshToken) {
      throw new ErrorResponse("No Token Provided", 401);
    }

    const session = await Session.findOne({
      refreshToken: currentRefreshToken,
    });

    if (!session) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      throw new ErrorResponse("Invalid Token or Experied", 403);
    }

    if (session.expiredAt.getTime() < Date.now()) {
      await session.deleteOne();
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      throw new ErrorResponse("Token is experied", 403);
    }

    const user = await User.findById(session.userId);
    if (!user) {
      await session.deleteOne();
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      throw new ErrorResponse(
        "User belonging to this session no longer exists",
        401,
      );
    }

    // Xóa session cũ
    await session.deleteOne();

    // Cấp session mới
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    // Lưu session vào DB
    await Session.create({
      userId: user._id,
      refreshToken: newRefreshToken,
      expiredAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Ghi đè cookie bằng refresh Token mới
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  },
);

export const logout = asyncWrapper(async (req: Request, res: Response) => {
  const currentRefreshToken = req.cookies.refreshToken;
  if (currentRefreshToken) {
    await Session.findOneAndDelete({ refreshToken: currentRefreshToken });
  }

  // 2. Xóa Cookie ở trình duyệt của người dùng
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({
    message: "Logged out successfully",
  });
});

export const getMet = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const user = req.user;

  res.status(200).json({ message: "Data of user", data: user });
});

export const updateProfile = asyncWrapper(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const updateData: UpdateUserDto = req.body;

    // 1. Kiểm tra tính duy nhất (Unique) một cách an toàn
    const uniqueFields: any[] = [];
    if (updateData.email) uniqueFields.push({ email: updateData.email });
    if (updateData.phoneNumber)
      uniqueFields.push({ phoneNumber: updateData.phoneNumber });

    if (uniqueFields.length > 0) {
      const existingUser = await User.findOne({
        $or: uniqueFields,
        _id: { $ne: new mongoose.Types.ObjectId(userId as string) }, // Loại trừ chính user đang cập nhật
      }).lean();

      if (existingUser) {
        const conflictField =
          existingUser.email === updateData.email ? "Email" : "Phone number";
        throw new ErrorResponse(`${conflictField} has already been taken`, 400);
      }
    }

    // 2. Cập nhật User
    // Sử dụng $set để đảm bảo chỉ những trường gửi lên mới bị thay đổi
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true, // Trả về document sau khi update
        runValidators: true, // Chạy validation của Mongoose Schema
        context: "query", // Cần thiết cho một số plugin validation
      },
    ).select("-hashedPassword");

    if (!updatedUser) {
      throw new ErrorResponse("User not found", 404);
    }

    // 3. Phản hồi
    res.status(200).json({
      success: true,
      message: "Updated User successfully",
      user: updatedUser,
    });
  },
);
