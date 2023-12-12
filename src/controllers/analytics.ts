import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";
import analyticsService from "../services/analytics";

// Create a new analytics:
export const createAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const analytics = await analyticsService.createAnalytics(req.body);

    sendResponse(res, 201, { analytics });
  }
);
