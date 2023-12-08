import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import mongoose from "mongoose";

// TODO: Need to handle error types:
// Handle CastError:
const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(400, message);
};
// Handle Duplicate Fields:
const handleDuplicateFieldsDB = (err: any) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `${value} already exists. Please use another value.`;
  return new AppError(400, message);
};
// Handle Validation Errors:
const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(400, message);
};

// Dev Error:
const sendErrDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};
// Prod Error:
const sendErrProd = (err: any, res: Response) => {
  if (err.isOperational) {
    // Operational error:
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Internal server error:
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
// Global Error Handler:
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Global Error Handler");
  console.log(err);
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;
  // Handle CastError:
  if (error instanceof mongoose.Error.CastError)
    error = handleCastErrorDB(error);
  // Handle Duplicate Fields:
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  // Handle Validation Errors:
  if (error instanceof mongoose.Error.ValidationError)
    error = handleValidationErrorDB(error);

  if (process.env.NODE_ENV === "development") {
    sendErrDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrProd(error, res);
  }
};

export default globalErrorHandler;
