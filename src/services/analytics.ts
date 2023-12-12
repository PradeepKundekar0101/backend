import AppError from "../utils/AppError";
import Analytics, { IAnalytics } from "../models/analytics";
import mongoose, { PipelineStage } from "mongoose";
import Video from "../models/video";

class AnalyticsServices {
  async createAnalytics(analyticsData: IAnalytics): Promise<IAnalytics> {
    const analytics = await Analytics.create(analyticsData);
    return analytics;
  }
}

export default new AnalyticsServices();
