import { RequestHandler, Request, Response, NextFunction } from "express";

export const asyncWrapper = (requestHandler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
