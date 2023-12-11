import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";
import analyticsService from "../services/analytics";
import validator from "validator";

// Create a new analytics:
export const createAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const analytics = await analyticsService.createAnalytics(req.body);

    sendResponse(res, 201, { analytics });
  }
);

// Get videos suggestions:
export const getVideosSuggestions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, tags } = req.body;

    if (!productId || !tags || tags.length === 0) {
      return next(new AppError(400, "Please provide product id and tags"));
    }

    if (!Array.isArray(tags)) {
      return next(new AppError(400, "Please provide an array of tags"));
    }

    if (!validator.isMongoId(productId)) {
      return next(new AppError(400, "Please provide a valid product id"));
    }

    tags.forEach((tag: string) => {
      if (!validator.isMongoId(tag)) {
        return next(new AppError(400, "Please provide a valid tag id"));
      }
    });

    const videos = await analyticsService.getVideosSuggestions(productId, tags);

    sendResponse(res, 200, { videos });
  }
);
