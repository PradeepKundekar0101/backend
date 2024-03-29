import { Request, Response, NextFunction } from "express";
import { catchAsync, sendResponse } from "../utils/api.utils";
import AppError from "../utils/AppError";
import ProductService from "../services/product";
import Product from "../models/product";

// Create a new Product
export const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return sendResponse(res, 400, { message: "File is required for creating a product" });
    }
    const product = await ProductService.createProduct(req.body, req.file);
    sendResponse(res, 201, { product });
  }
);

// Get all products
export const getAllProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const queryParams = req.query;
    const products = await ProductService.getAllProducts(queryParams);
    sendResponse(res, 201, { products });
  }
);

//Get Product By Id
export const getProductById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    if (!productId) {
      return next(new AppError(400, "Please provide Product Id"));
    }

    const product = await ProductService.getProduct(productId);

    if (!product) {
      return next(new AppError(404, `Product with id ${productId} not found`));
    }
    sendResponse(res, 200, { product });
  }
);

//Update Product with Tags
export const updateProductWithTags = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.productId;
    const { tags } = req.body;
   
    if (!tags || tags.length == 0) {
      return next(new AppError(400, "Please provide tags for the product"));
    }
    
    const updatedProduct = await ProductService.updateProductWithTags(productId,tags);
    sendResponse(res, 201, { updatedProduct });
  }
);

//Update Product
export const updateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    if (!productId) {
      return next(new AppError(400, "Please provide productId"));
    }

    const product = await ProductService.updateProduct(productId, req.body,req.file);

    if (!product) {
      return next(new AppError(404, `Product with id ${productId} not found`));
    }
    sendResponse(res, 200, { product });
  }
);

//Delete Product
export const deleteProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    if (!productId) {
      return next(new AppError(400, "Please provide productId"));
    }

    const deletedProduct = await ProductService.deleteProduct(productId);

    if (!deletedProduct) {
      return next(new AppError(404, `Product with id ${productId} not found`));
    }
    sendResponse(res, 204, {});
  }
);
