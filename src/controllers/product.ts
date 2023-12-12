import { Request, Response, NextFunction } from "express";
import { catchAsync, sendResponse } from "../utils/api.utils";
import AppError from "../utils/AppError";
import ProductService from "../services/product";

// Create a new Product
export const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const product = await ProductService.createProduct(req.body);
    sendResponse(res, 201, { product });
  }
);

// Get all products
export const getAllProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await ProductService.getAllProducts();
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
    const tags = req.body.tags;

    if (!productId) {
      return next(new AppError(400, "Please provide productId"));
    }
    
    if (!tags || tags.length == 0) {
      return next(new AppError(400, "Please provide tags for the product"));
    }
    
    const updatedProduct = await ProductService.updateProductWithTags(
      productId,
      tags
    );
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
    const product = await ProductService.updateProduct(productId, req.body);
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
