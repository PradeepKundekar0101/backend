import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.";
import { createActivity, getActivities } from "../services/activity";
import { IActivity } from "../models/activity";
import AppError from "../utils/AppError";

// GET:
export const getActivitiesController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const activities = await getActivities();

    res.status(200).json({
      status: "success",
      data: {
        activities,
      },
    });
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

    res.status(201).json({
      status: "success",
      data: {
        activity,
      },
    });
  }
);
