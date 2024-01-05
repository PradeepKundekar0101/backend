import mongoose, { PipelineStage } from "mongoose";

export const specificCategoryStatsPipeline = (categoryId: string) => {
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
        $divide: [
          { $subtract: ["$totalIssues", "$totalTicketsRaised"] },
          "$totalIssues",
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

  return statsAggPipeline;
};
