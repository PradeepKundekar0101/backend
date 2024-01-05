import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";
import helpdeskService from "../services/helpdesk";

// Create a new helpdesk:
export const createHelpDesk = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return sendResponse(res, 400, { message: "File is required for creating a HelpDesk" });
    }
    const helpdesk = await helpdeskService.createHelpDesk(req.body,req.file);
    sendResponse(res, 201, { helpdesk });
  }
);

// Get all helpdesk:
export const getAllHelpDesk = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const helpdesks = await helpdeskService.getAllHelpDesk();
    sendResponse(res, 200, { helpdesks });
  }
);

// Get helpdesk by id:
export const getHelpDeskById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { helpdeskId } = req.params;
    if (!helpdeskId) {
      return next(new AppError(400, "Please provide helpdeskId"));
    }
    const helpdesk = await helpdeskService.getHelpDeskById(helpdeskId);
    if (!helpdesk) {
      return next(
        new AppError(404, `Helpdesk with id ${helpdeskId} not found`)
      );
    }
    sendResponse(res, 200, { helpdesk });
  }
);

// Update helpdesk:
export const updateHelpDesk = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { helpdeskId } = req.params;
    if (!helpdeskId) {
      return next(new AppError(400, "Please provide helpdeskId"));
    }

    const helpdesk = await helpdeskService.updateHelpDesk(helpdeskId, req.body,req.file);

    if (!helpdesk) {
      return next(
        new AppError(404, `Helpdesk with id ${helpdeskId} not found`)
      );
    }

    sendResponse(res, 200, { helpdesk });
  }
);

// Delete helpdesk:
export const deleteHelpDesk = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { helpdeskId } = req.params;
    if (!helpdeskId) {
      return next(new AppError(400, "Please provide helpdeskId"));
    }

    const helpdesk = await helpdeskService.deleteHelpDesk(helpdeskId);

    if (!helpdesk) {
      return next(
        new AppError(404, `Helpdesk with id ${helpdeskId} not found`)
      );
    }
    res.status(204).json();
  }
);
