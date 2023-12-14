import AppError from "../utils/AppError";
import Analytics, { IAnalytics } from "../models/analytics";
import mongoose, { PipelineStage } from "mongoose";
import Category from "../models/category";
import Product from "../models/product";

class AnalyticsServices {
  async createAnalytics(analyticsData: IAnalytics): Promise<IAnalytics> {
    const analytics = await Analytics.create(analyticsData);
    return analytics;
  }

  // Get Basic Analytics Stats:

  // Get Stats of all Categories:
  async getAllCategoryStats(): Promise<any> {
    const statsAggPipeline: PipelineStage[] = [];

    // Get all categories:
    statsAggPipeline.push(
      { $match: {} },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      }
    );

    // Get All products under each category:
    statsAggPipeline.push({
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
        as: "products",
      },
    });

    // Get analytics related to each category:
    statsAggPipeline.push(
      {
        $lookup: {
          from: "analytics",
          localField: "_id",
          foreignField: "categorySelected",
          as: "analytics",
        },
      },
      {
        $unwind: "$analytics",
      }
    );

    // Group by category:
    statsAggPipeline.push({
      $group: {
        _id: "$_id",
        totalIssues: { $sum: 1 },
        category: { $first: "$name" },
        products: { $first: "$products" },
        productsWithIssues: { $addToSet: "$analytics.productSelected" },
        totalVisitors: { $addToSet: "$analytics.sessionId" },
        avgTimeOnSite: { $avg: "$analytics.timeOnSite" },
      },
    });

    // Project:
    statsAggPipeline.push({
      $project: {
        _id: 1,
        totalProducts: { $size: "$products" },
        productsWithIssues: { $size: "$productsWithIssues" },
        totalIssues: 1,
        category: 1,
        totalVisitors: { $size: "$totalVisitors" },
        avgTimeOnSite: 1,
      },
    });

    // // Sort by total issues, products with issues, total visitors, avg time on site:
    statsAggPipeline.push({
      $sort: {
        totalIssues: -1,
        productsWithIssues: -1,
        totalVisitors: -1,
        avgTimeOnSite: -1,
      },
    });

    const categoryStats = await Category.aggregate(statsAggPipeline);

    return categoryStats;
  }

  // Get Stats of a specific Category:
  async getCategoryStatsById(categoryId: string): Promise<any> {
    const statsAggPipeline: PipelineStage[] = [];

    // Match category by id:
    statsAggPipeline.push(
      { $match: { category: new mongoose.Types.ObjectId(categoryId) } },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      }
    );

    // Get Analytics related to each product:
    statsAggPipeline.push(
      {
        $lookup: {
          from: "analytics",
          localField: "_id",
          foreignField: "productSelected",
          as: "analytics",
        },
      },
      {
        $unwind: "$analytics",
      }
    );

    // Group by product:
    statsAggPipeline.push({
      $group: {
        _id: "$_id",
        totalIssues: { $sum: 1 },
        product: { $first: "$name" },
        totalVisitors: { $addToSet: "$analytics.sessionId" },
        avgTimeOnSite: { $avg: "$analytics.timeOnSite" },
        ticketsRaised: { $addToSet: "$analytics.customerSupportMetadata" },
      },
    });

    // // Project:
    statsAggPipeline.push({
      $project: {
        _id: 1,
        totalIssues: 1,
        product: 1,
        totalVisitors: { $size: "$totalVisitors" },
        avgTimeOnSite: 1,
        totalTicketsRaised: { $size: "$ticketsRaised" },
      },
    });

    // Calculate the system efficiency:
    statsAggPipeline.push({
      $addFields: {
        systemEfficiency: {
          $multiply: [
            {
              $divide: [
                { $subtract: ["$totalIssues", "$totalTicketsRaised"] },
                "$totalIssues",
              ],
            },
            100,
          ],
        },
      },
    });

    // Sort by total issues, total visitors, avg time on site, system efficiency:
    statsAggPipeline.push({
      $sort: {
        totalIssues: -1,
        totalVisitors: -1,
        avgTimeOnSite: -1,
        systemEfficiency: -1,
      },
    });

    const categorystats = await Product.aggregate(statsAggPipeline);

    return categorystats;
  }
}

export default new AnalyticsServices();
