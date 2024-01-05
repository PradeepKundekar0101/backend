import Analytics, { IAnalytics } from "../models/analytics";
import Category from "../models/category";
import Product from "../models/product";
import { allCategoryStatsPipeline } from "./pipelines/analytics/allCategoryStats";
import { specificCategoryStatsPipeline } from "./pipelines/analytics/specificCategoryStats";
import { specificProductStatsPipeline } from "./pipelines/analytics/specificProductStats";
import { overallStatsPipeline } from "./pipelines/analytics/overallStats";
import { dashboardStatsPipeline } from "./pipelines/analytics/dashboardStats";

class AnalyticsServices {
  async createAnalytics(analyticsData: IAnalytics): Promise<IAnalytics> {
    const analytics = await Analytics.create(analyticsData);
    return analytics;
  }

  // Get Dashboard Stats:
  async getDashboardStats(): Promise<any> {
    const dashboardStats = await Analytics.aggregate(dashboardStatsPipeline());

    // Get total categories, products and videos watched:
    const totalCategories = await Category.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Get total videos watched:
    return { ...dashboardStats[0], totalCategories, totalProducts };
  }

  // Get Overall Stats:
  async getOverallStats(from: Date, to: Date): Promise<any> {
    const overallStats = await Analytics.aggregate(
      overallStatsPipeline(from, to)
    );

    // Sort the categories selected by freq, products selected by freq, locations by freq, tags selected by freq, videos watched by total views:
    overallStats[0]?.categoriesSelected.sort(
      (a: any, b: any) => b.freq - a.freq
    );
    overallStats[0]?.productsSelected.sort((a: any, b: any) => b.freq - a.freq);
    overallStats[0]?.locations.sort((a: any, b: any) => b.freq - a.freq);
    overallStats[0]?.videosWatched.sort(
      (a: any, b: any) => b.totalViews - a.totalViews
    );

    return overallStats[0];
  }

  // Get Stats of all Categories:
  async getAllCategoryStats(): Promise<any> {
    const categoryStats = await Category.aggregate(allCategoryStatsPipeline());
    return categoryStats;
  }

  // Get Stats of a specific Category:
  async getCategoryStatsById(categoryId: string): Promise<any> {
    const categorystats = await Product.aggregate(
      specificCategoryStatsPipeline(categoryId)
    );

    return categorystats;
  }

  // Get Product Specific Stats:
  async getProductStatsById(productId: string): Promise<any> {
    const productStats = await Product.aggregate(
      specificProductStatsPipeline(productId)
    );

    productStats[0]?.tagsSelected.sort((a: any, b: any) => b.freq - a.freq);
    productStats[0]?.videosWatched.sort(
      (a: any, b: any) => b.totalViews - a.totalViews
    );

    return productStats[0];
  }
}

export default new AnalyticsServices();
