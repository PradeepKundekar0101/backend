import { PipelineStage } from "mongoose";

export const overallStatsPipeline = (from: Date, to: Date) => {
  const statsAggPipeline: PipelineStage[] = [];

  // Match analytics in last 7 days:
  statsAggPipeline.push({
    $match: {
      createdAt: {
        $gte: from,
        $lte: to,
      },
    },
  });

  // Get stats of last 7 days:
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
        tagsSelected: {
          $addToSet: "$tagsSelected",
        },
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
        tagsSelected: { $first: "$tagsSelected" },
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
        tagsSelected: { $first: "$tagsSelected" },
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
        tagsSelected: { $first: "$tagsSelected" },
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
        tagsSelected: { $first: "$tagsSelected" },
        videosWatched: { $first: "$videosWatched" },
      },
    }
  );

  // Unwind and Populate the tags selected:
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
        categoriesSelected: { $first: "$categoriesSelected" },
        productsSelected: { $first: "$productsSelected" },
        locations: { $first: "$locations" },
        tagsSelected: { $push: "$tagsSelected" },
        videosWatched: { $first: "$videosWatched" },
      },
    },
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
        categoriesSelected: { $first: "$categoriesSelected" },
        productsSelected: { $first: "$productsSelected" },
        locations: { $first: "$locations" },
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
        tagsSelected: { $first: "$tagsSelected" },
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
        tagsSelected: { $first: "$tagsSelected" },
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
        tagsSelected: { $first: "$tagsSelected" },
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
      tagsSelected: 1,
      videosWatched: 1,
    },
  });

  return statsAggPipeline;
};
