import { PipelineStage } from "mongoose";
const timelineStatsPipeline = (from?: Date) => {
  const aggPipeline: PipelineStage.FacetPipelineStage[] = [];

  // Match analytics:
  if (from) {
    aggPipeline.push({
      $match: {
        createdAt: {
          $gte: from,
        },
      },
    });
  } else {
    aggPipeline.push({
      $match: {},
    });
  }

  // Calculate stats:
  aggPipeline.push(
    {
      $group: {
        _id: null,
        totalIssues: { $sum: 1 },
        totalVisitors: { $addToSet: "$sessionId" },
        totalTimeOnSite: { $sum: "$timeOnSite" },
        avgTimeOnSite: { $avg: "$timeOnSite" },
        totalTicketsRaised: { $addToSet: "$customerSupportMetadata" },
      },
    },
    {
      $project: {
        _id: 0,
        totalIssues: 1,
        totalVisitors: { $size: "$totalVisitors" },
        totalTimeOnSite: 1,
        avgTimeOnSite: 1,
        totalTicketsRaised: { $size: "$totalTicketsRaised" },
      },
    }
  );

  // System Efficiency:
  aggPipeline.push({
    $addFields: {
      systemEfficiency: {
        $divide: [
          { $subtract: ["$totalIssues", "$totalTicketsRaised"] },
          "$totalIssues",
        ],
      },
    },
  });

  return aggPipeline;
};

export const dashboardStatsPipeline = () => {
  const statsAggPipeline: PipelineStage[] = [];
  const last24Hr = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const lastYear = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

  // Calculate stats for the last 24 hr, last 30 days, last year and all time:
  statsAggPipeline.push({
    $facet: {
      last24Hr: timelineStatsPipeline(last24Hr),
      last30Days: timelineStatsPipeline(last30Days),
      lastYear: timelineStatsPipeline(lastYear),
      allTime: timelineStatsPipeline(),
    },
  });

  //   Project:
  statsAggPipeline.push({
    $project: {
      last24Hr: { $arrayElemAt: ["$last24Hr", 0] },
      last30Days: { $arrayElemAt: ["$last30Days", 0] },
      lastYear: { $arrayElemAt: ["$lastYear", 0] },
      allTime: { $arrayElemAt: ["$allTime", 0] },
    },
  });

  return statsAggPipeline;
};
