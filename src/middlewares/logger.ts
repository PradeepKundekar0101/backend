import { Request, Response, NextFunction } from "express";
import {
  httpLogger,
  errorLogger,
  formatHTTPLoggerResponse,
} from "../utils/logger";

// Response interceptor:
export const responseInterceptor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;
  const requestStartTime = Date.now();

  res.send = (body: any): Response => {
    if (res.statusCode < 400) {
      httpLogger.info(
        "HTTP Response",
        formatHTTPLoggerResponse(req, res, body, requestStartTime)
      );
    } else {
      httpLogger.error(
        body.message || "HTTP Response",
        formatHTTPLoggerResponse(req, res, body, requestStartTime)
      );
    }

    return originalSend.call(res, body);
  };

  next();
};

// Error interceptor:
export const errorInterceptor = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;
  const requestStartTime = Date.now();

  res.send = (body: any): Response => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    errorLogger.error(
      err.message || "Something went wrong!",
      formatHTTPLoggerResponse(req, res, error, requestStartTime)
    );

    return originalSend.call(res, body);
  };

  next(err);
};
