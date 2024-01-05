import { Request, Response, NextFunction } from "express";
import tagServices from "../services/tag";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";
import Tag from "../models/tag";
// Update a tag:
export const getTagById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tagId } = req.params;
   const tag = await Tag.findById(tagId);
    sendResponse(res, 200, { tag });
  }
);


// Update a tag:
export const updateTag = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tagId } = req.params;
    const { name } = req.body;

    if (!tagId) {
      return next(new AppError(400, "Please provide a tagId"));
    }

    if (!name) {
      return next(new AppError(400, "Please provide a name"));
    }

    const tag = await tagServices.updateTag(tagId, name);

    if (!tag) {
      return next(new AppError(404, `Tag with id ${tagId} not found`));
    }

    sendResponse(res, 200, { tag });
  }
);
