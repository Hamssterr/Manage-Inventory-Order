import { Request, Response } from "express";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import Route from "../models/Route.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";
import {
  formatPaginationResponse,
  getPaginationParams,
} from "../utils/pagination.js";

export const createRoute = asyncWrapper(async (req: Request, res: Response) => {
  const { routeName, description, responsibleSale } = req.body;

  const existingRoute = await Route.findOne({ routeName });
  if (existingRoute) {
    throw new ErrorResponse("Route already exists", 400);
  }

  const route = await Route.create({ routeName, description, responsibleSale });
  res.status(201).json({
    success: true,
    message: "New route has been created",
    data: route,
  });
});

export const getRouteList = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req);

    const [routes, totalItems] = await Promise.all([
      Route.find()
        .skip(skip)
        .limit(limit)
        .populate("responsibleSale", "displayName phoneNumber")
        .sort({ createdAt: -1 }),
      Route.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      ...formatPaginationResponse(routes, totalItems, page, limit),
    });
  },
);

export const updateRoute = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedRoute = await Route.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedRoute) {
    throw new ErrorResponse("Route not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Route has been updated",
    data: updatedRoute,
  });
});

export const deleteRoute = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedRoute = await Route.findByIdAndDelete(id);

  if (!deletedRoute) {
    throw new ErrorResponse("Route not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Route has been deleted",
  });
});
