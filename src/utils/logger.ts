import { Request, Response } from "express";
import { randomBytes } from "crypto";
import wiston from "winston";

const { combine, timestamp, json, printf } = wiston.format;
const timestampFormat = "DD-MMM-YYYY HH:mm:ss";

const generateLogId = (): string => randomBytes(16).toString("hex");

// Format HTTP logs:
export const formatHTTPLoggerResponse = (
  req: Request,
  res: Response,
  responseBody: any,
  requestStartTime?: number
) => {
  let requestDuration;

  if (requestStartTime) {
    const requestEndTime = Date.now() - requestStartTime;

    requestDuration = requestEndTime / 1000;
  }

  return {
    request: {
      headers: req.headers,
      host: req.headers.host,
      baseUrl: req.baseUrl,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req?.params,
      query: req?.query,
    },
    response: {
      headers: res.getHeaders(),
      statusCode: res.statusCode,
      requestDuration,
      body: responseBody,
    },
  };
};

// Logger format:
const logggerFormat = combine(
  timestamp({ format: timestampFormat }),
  json(),
  printf(({ timestamp, level, message, ...data }) => {
    const response = {
      level,
      logId: generateLogId(),
      timestamp,
      appInfo: {
        appversion: process.env.npm_package_version,
        environment: process.env.NODE_ENV,
        processId: process.pid,
      },
      message,
      data,
    };

    return JSON.stringify(response);
  })
);
// Logger for API endpoints:
export const httpLogger = wiston.createLogger({
  format: logggerFormat,
  transports: [
    new wiston.transports.File({
      filename: "logs/http/applicaton.log",
    }),
  ],
});

// Error logger:
export const errorLogger = wiston.createLogger({
  format: logggerFormat,
  transports: [
    new wiston.transports.File({
      filename: "logs/error/error.log",
      level: "error",
    }),
  ],
});
