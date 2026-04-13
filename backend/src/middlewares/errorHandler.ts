import { Request, Response, NextFunction } from "express";
import type { ErrorResponse } from "../utils/ErrorResponse.js";

export const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("\x1b[31m%s\x1b[0m", err);
  res.status(err.statusCode || 500).json({
    status: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  });
};
