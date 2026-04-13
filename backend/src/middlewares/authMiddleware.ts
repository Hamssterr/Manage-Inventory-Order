import type { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import type { IUser } from "../models/User.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protectAuth = asyncWrapper(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ErrorResponse(
        "Not authorized to access this route. No token provided.",
        401,
      );
    }
    try {
      // Xác minh token bằng Secret Key
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as { userId: string };

      const currentUser = await User.findById(decoded.userId).select(
        "-hashedPassword",
      );

      if (!currentUser) {
        throw new ErrorResponse(
          "The user belonging to this token no longer exists.",
          401,
        );
      }

      req.user = currentUser;
      next();
    } catch (error) {
      throw new ErrorResponse(
        `Not authorized. Token is invalid or expired. : ${error}`,
        401,
      );
    }
  },
);

export const restrictTo = (...role: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ErrorResponse("Not authorized! No user found.", 401);
    }

    const userRole = req.user.role;

    if (!role.includes(userRole)) {
      throw new ErrorResponse(
        "You do not have permission to perform this action!",
        403,
      );
    }

    next();
  };
};
