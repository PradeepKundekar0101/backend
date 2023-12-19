import mongoose, { PipelineStage } from "mongoose";

export const specificProductStatsPipeline = (productId: string) => {
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

  return statsAggPipeline;
};
