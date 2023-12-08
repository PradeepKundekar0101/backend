import { Request, Response, NextFunction } from "express";
import { catchAsync, sendResponse } from "../utils/api.utils";
import { createActivity, getActivities } from "../services/activity";
import { IActivity } from "../models/activity";
import AppError from "../utils/AppError";

// GET:
export const getActivitiesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const activities = await getActivities();

    sendResponse(res, 200, { activities });
  }
);

// POST:
export const createActivityController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, product, tags, videosWatched }: IActivity = req.body;
    // Validate body:
    if (!category || !product || !tags || !videosWatched) {
      return next(new AppError(400, "Please provide all required fields."));
    }

    const activity = await createActivity(req.body);

    sendResponse(res, 201, { activity });
  }
);
