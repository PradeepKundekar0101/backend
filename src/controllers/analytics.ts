import { Request, Response, NextFunction } from "express";
import IPinfoWrapper, {
  ApiLimitError,
  IPinfo,
  LruCache,
  Options,
} from "node-ipinfo";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";
import analyticsService from "../services/analytics";

// Cache for IPinfo with a max size of 5000 and a TTL of 2 days:
const cacheOptions: Options<string, any> = {
  max: 5000,
  ttl: 2 * 24 * 1000 * 60 * 60,
};

const cache = new LruCache(cacheOptions);

const ipinfo = new IPinfoWrapper(process.env.IPINFO_ACCESS_TOKEN!, cache);

// Create a new analytics:
export const createAnalytics = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get the IP address of the user:
    const userIP = req.ip || "0.0.0.0";
    let location = "Unknown";

    try {
      // Get the location of the user:
      const ipDetails: IPinfo = await ipinfo.lookupIp(userIP);
      location = ipDetails.country || "Unknown";
    } catch (err) {
      if (err instanceof ApiLimitError) {
        console.log("IP_Info API limit reached");
      } else {
        console.log(err);
      }
    }

    const analytics = await analyticsService.createAnalytics({
      ...req.body,
      sessionId: userIP,
      location: location,
    });

    sendResponse(res, 201, { analytics });
  }
);

// Get Dashboard Stats:
export const getDashboardStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const dashboardStats = await analyticsService.getDashboardStats();

    sendResponse(res, 200, { dashboardStats });
  }
);

// Get overall stats:
export const getOverallStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { from, to } = req.query;

    // Check if from and to are valid dates:
    const fromDate = from
      ? new Date(Number(from))
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(Number(to)) : new Date(Date.now());

    if (fromDate.toString() === "Invalid Date") {
      return next(new AppError(400, "Please provide a valid from date"));
    }

    if (toDate.toString() === "Invalid Date") {
      return next(new AppError(400, "Please provide a valid to date"));
    }

    if (fromDate > toDate) {
      return next(
        new AppError(400, "From date cannot be greater than to date")
      );
    }

    const overAllStats = await analyticsService.getOverallStats(
      fromDate,
      toDate
    );

    sendResponse(res, 200, { overAllStats });
  }
);

// Get category stats:
export const getAllCategoryStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryStats = await analyticsService.getAllCategoryStats();
    sendResponse(res, 200, { categoryStats });
  }
);

// Get Specific Category Stats:
export const getCategoryStatsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryStats = await analyticsService.getCategoryStatsById(
      req.params.categoryId
    );

    sendResponse(res, 200, { categoryStats });
  }
);

// Get Specific Product Stats:
export const getProductStatsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productStats = await analyticsService.getProductStatsById(
      req.params.productId
    );

    sendResponse(res, 200, { productStats });
  }
);
