import { asyncWrapper } from "../utils/asyncWrapper.js";
import User from "../models/User.js";
import type { Request, Response } from "express";

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
