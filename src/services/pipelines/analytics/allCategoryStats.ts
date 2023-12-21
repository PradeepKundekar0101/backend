import { PipelineStage } from "mongoose";

export const allCategoryStatsPipeline = () => {
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
      ticketsRaised: { $addToSet: "$analytics.customerSupportMetadata" },
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

  // // Sort by total issues, products with issues, total visitors, avg time on site:
  statsAggPipeline.push({
    $sort: {
      totalIssues: -1,
      productsWithIssues: -1,
      totalVisitors: -1,
      avgTimeOnSite: -1,
      systemEfficiency: -1,
    },
  });

  return statsAggPipeline;
};
