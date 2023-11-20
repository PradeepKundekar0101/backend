import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync.util";
import { createActivity, getActivities } from "../services/activity.services";
import { IActivity } from "../models/activity.model";

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
      return res.status(400).json({
        status: "fail",
        message:
          "Missing required fields: category, product, tags, videosWatched",
      });
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
