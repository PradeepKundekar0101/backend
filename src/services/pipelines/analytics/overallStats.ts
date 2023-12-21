import { PipelineStage } from "mongoose";

export const overallStatsPipeline = (from: Date, to: Date) => {
  const statsAggPipeline: PipelineStage[] = [];

  // Match analytics in the time range:
  statsAggPipeline.push({
    $match: {
      createdAt: {
        $gte: from,
        $lte: to,
      },
    },
  });

  // Get stats:
  statsAggPipeline.push(
    {
      $group: {
        _id: null,
        totalIssues: { $sum: 1 },
        totalVisitors: { $addToSet: "$sessionId" },
        totalTimeOnSite: { $sum: "$timeOnSite" },
        avgTimeOnSite: { $avg: "$timeOnSite" },
        locations: { $push: "$location" },
        categoriesSelected: { $push: "$categorySelected" },
        productsSelected: { $push: "$productSelected" },
        totalTicketsRaised: { $addToSet: "$customerSupportMetadata" },
        videosWatched: {
          $addToSet: "$videosWatched",
        },
      },
    },
    {
      $addFields: {
        stats: {
          totalIssues: "$totalIssues",
          totalVisitors: { $size: "$totalVisitors" },
          totalTimeOnSite: "$totalTimeOnSite",
          avgTimeOnSite: "$avgTimeOnSite",
          totalTicketsRaised: { $size: "$totalTicketsRaised" },
        },
      },
    }
  );

  // Unwind and Populate the categories selected:
  statsAggPipeline.push(
    {
      $unwind: "$categoriesSelected",
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          category: "$categoriesSelected",
        },
        stats: { $first: "$stats" },
        categoriesSelected: { $push: "$categoriesSelected" },
        locations: { $first: "$locations" },
        productsSelected: { $first: "$productsSelected" },
        videosWatched: { $first: "$videosWatched" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id.category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$categoryDetails",
    },
    {
      $group: {
        _id: "$_id._id",
        stats: { $first: "$stats" },
        categoriesSelected: {
          $push: {
            _id: "$_id.category",
            name: "$categoryDetails.name",
            freq: { $size: "$categoriesSelected" },
          },
        },
        locations: { $first: "$locations" },
        productsSelected: { $first: "$productsSelected" },
        videosWatched: { $first: "$videosWatched" },
      },
    }
  );

  // Unwind and Populate the products selected:
  statsAggPipeline.push(
    {
      $unwind: "$productsSelected",
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          product: "$productsSelected",
        },
        stats: { $first: "$stats" },
        categoriesSelected: { $first: "$categoriesSelected" },
        productsSelected: { $push: "$productsSelected" },
        locations: { $first: "$locations" },
        videosWatched: { $first: "$videosWatched" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
    {
      $group: {
        _id: "$_id._id",
        stats: { $first: "$stats" },
        categoriesSelected: { $first: "$categoriesSelected" },
        productsSelected: {
          $push: {
            _id: "$_id.product",
            name: "$productDetails.name",
            freq: { $size: "$productsSelected" },
          },
        },
        locations: { $first: "$locations" },
        videosWatched: { $first: "$videosWatched" },
      },
    }
  );

  // Unwind and Populate the videos watched:
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
        categoriesSelected: { $first: "$categoriesSelected" },
        productsSelected: { $first: "$productsSelected" },
        locations: { $first: "$locations" },
        videosWatched: { $push: "$videosWatched" },
      },
    },
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
        categoriesSelected: { $first: "$categoriesSelected" },
        productsSelected: { $first: "$productsSelected" },
        locations: { $first: "$locations" },
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

  // Unwind and Populate the locations:
  statsAggPipeline.push(
    {
      $unwind: "$locations",
    },
    {
      $group: {
        _id: {
          _id: "$_id",
          location: "$locations",
        },
        stats: { $first: "$stats" },
        categoriesSelected: { $first: "$categoriesSelected" },
        productsSelected: { $first: "$productsSelected" },
        locations: { $push: "$locations" },
        videosWatched: { $first: "$videosWatched" },
      },
    },
    {
      $group: {
        _id: "$_id._id",
        stats: { $first: "$stats" },
        categoriesSelected: { $first: "$categoriesSelected" },
        productsSelected: { $first: "$productsSelected" },
        locations: {
          $push: {
            _id: "$_id.location",
            freq: { $size: "$locations" },
          },
        },
        videosWatched: { $first: "$videosWatched" },
      },
    }
  );

  // Project:
  statsAggPipeline.push({
    $project: {
      _id: 0,
      stats: {
        $mergeObjects: {
          totalIssues: "$stats.totalIssues",
          totalVisitors: "$stats.totalVisitors",
          totalTimeOnSite: "$stats.totalTimeOnSite",
          avgTimeOnSite: "$stats.avgTimeOnSite",
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
      categoriesSelected: 1,
      productsSelected: 1,
      locations: 1,
      videosWatched: 1,
    },
  });

  return statsAggPipeline;
};
