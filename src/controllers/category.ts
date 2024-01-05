import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";
import categoryService from "../services/category";
import Category from "../models/category";

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return sendResponse(res, 400, {
        message: "File is required for creating a category",
      });
    }
    const category = await categoryService.createCategory(req.body, req.file);
    sendResponse(res, 201, { category });
  }
);

// Get all categories:
export const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await categoryService.getAllCategories();
    sendResponse(res, 200, { categories });
  }
);

// Get category by id:
export const getCategoryById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      return next(new AppError(400, "Please provide categoryId"));
    }
    const category = await categoryService.getCategoryById(categoryId);
    if (!category) {
      return next(
        new AppError(404, `Category with id ${categoryId} not found`)
      );
    }
    sendResponse(res, 200, { category });
  }
);

// Update category:
export const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    if (!categoryId) {
      return next(new AppError(400, "Please provide categoryId"));
    }
    const category = await categoryService.updateCategory(
      categoryId,
      req.body,
      req.file
    );
    if (!category) {
      return next(
        new AppError(404, `Category with id ${categoryId} not found`)
      );
    }
    sendResponse(res, 200, { category });
  }
);

// Delete category:
export const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    if (!categoryId) {
      return next(new AppError(400, "Please provide categoryId"));
    }

    const deletedCategory = await categoryService.deleteCategory(categoryId);

    if (!deletedCategory) {
      return next(
        new AppError(404, `Category with id ${categoryId} not found`)
      );
    }
    res.status(204).json();
  }
);
