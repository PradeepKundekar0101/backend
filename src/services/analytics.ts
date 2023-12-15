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

  // Get Overall Stats:
  async getOverallStats(): Promise<any> {}

  // Get Stats of all Categories:
  async getAllCategoryStats(): Promise<any> {
    const statsAggPipeline: PipelineStage[] = [];

    // Get all categories and project only _id and name:
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

  // Get Product Specific Stats:
  async getProductStatsById(productId: string): Promise<any> {
    const statsAggPipeline: PipelineStage[] = [];

    // Match product by id:
    statsAggPipeline.push(
      { $match: { _id: new mongoose.Types.ObjectId(productId) } },
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
        avgTimeOnSite: { $avg: "$analytics.timeOnSite" },
        tagsSelected: { $push: "$analytics.tagsSelected" },
        videosWatched: { $push: "$analytics.videosWatched" },
        totalVisitors: { $addToSet: "$analytics.sessionId" },
        ticketsRaised: { $addToSet: "$analytics.customerSupportMetadata" },
      },
    });

    // save the stats in a variable:
    statsAggPipeline.push({
      $addFields: {
        stats: {
          totalIssues: "$totalIssues",
          avgTimeOnSite: "$avgTimeOnSite",
          totalVisitors: { $size: "$totalVisitors" },
          totalTicketsRaised: { $size: "$ticketsRaised" },
        },
      },
    });

    // tagsSelected stats:
    statsAggPipeline.push(
      {
        $unwind: "$tagsSelected",
      },
      {
        $unwind: "$tagsSelected",
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            tag: "$tagsSelected",
          },
          stats: { $first: "$stats" },
          tagsSelected: { $push: "$tagsSelected" },
          videosWatched: { $first: "$videosWatched" },
        },
      },
      // Get tag details:
      {
        $lookup: {
          from: "tags",
          localField: "_id.tag",
          foreignField: "_id",
          as: "tagDetails",
        },
      },
      {
        $unwind: "$tagDetails",
      },
      {
        $group: {
          _id: "$_id._id",
          stats: { $first: "$stats" },
          tagsSelected: {
            $push: {
              tag: "$_id.tag",
              name: "$tagDetails.name",
              freq: { $size: "$tagsSelected" },
            },
          },
          videosWatched: { $first: "$videosWatched" },
        },
      }
    );

    // videosWatched stats:
    statsAggPipeline.push(
      {
        $unwind: "$videosWatched",
      },
      {
        $unwind: "$videosWatched",
      },
      {
        $group: {
          _id: {
            _id: "$_id",
            videoId: "$videosWatched.videoId",
          },
          stats: { $first: "$stats" },
          videosWatched: { $push: "$videosWatched" },
          tagsSelected: { $first: "$tagsSelected" },
        },
      },
      // Get video details:
      {
        $lookup: {
          from: "videos",
          localField: "_id.videoId",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      {
        $unwind: "$videoDetails",
      },
      {
        $group: {
          _id: "$_id._id",
          stats: { $first: "$stats" },
          tagsSelected: { $first: "$tagsSelected" },
          videosWatched: {
            $push: {
              _id: "$_id.videoId",
              ytVideoId: "$videoDetails.videoId",
              totalViews: { $size: "$videosWatched" },
              totalWatchTime: { $sum: "$videosWatched.watchTime" },
              avgWatchTime: { $avg: "$videosWatched.watchTime" },
              avgCompletionRatio: { $avg: "$videosWatched.completionRatio" },
              helpfulnessRatio: {
                $avg: {
                  $map: {
                    input: "$videosWatched",
                    as: "video",
                    in: {
                      $cond: {
                        if: "$$video.wasHelpful",
                        then: 1,
                        else: 0,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }
    );

    // // Project:
    statsAggPipeline.push({
      $project: {
        _id: 1,
        stats: {
          $mergeObjects: {
            totalIssues: "$stats.totalIssues",
            avgTimeOnSite: "$stats.avgTimeOnSite",
            totalVisitors: "$stats.totalVisitors",
            totalTicketsRaised: "$stats.totalTicketsRaised",
            systemEfficiency: {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: [
                        "$stats.totalIssues",
                        "$stats.totalTicketsRaised",
                      ],
                    },
                    "$stats.totalIssues",
                  ],
                },
                100,
              ],
            },
          },
        },
        tagsSelected: 1,
        videosWatched: 1,
      },
    });

    const productStats = await Product.aggregate(statsAggPipeline);

    return productStats[0];
  }
}

export default new AnalyticsServices();
