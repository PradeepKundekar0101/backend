import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";

import zendeskService from "../services/zendesk";

export const createTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, description } = req.body;

    if (!name || !email || !description) {
      return next(new AppError(400, "Please provide all the required fields"));
    }

    const ticket = await zendeskService.createTicket(name, email, description);

    sendResponse(res, 201, { ticket });
  }
);
