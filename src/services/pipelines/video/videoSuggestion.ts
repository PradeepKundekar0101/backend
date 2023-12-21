import mongoose, { PipelineStage } from "mongoose";

export const videoRankingPipeline = (productId: string, tags: string[]) => {
  const videoAggPipeline: PipelineStage[] = [];
  const rankAggPipeline: PipelineStage[] = [];

  const queryProduct = new mongoose.Types.ObjectId(productId);
  const queryTags = tags.map((tag) => new mongoose.Types.ObjectId(tag));

  // Match videos with the product id and atleast one tag:
  videoAggPipeline.push(
    {
      $match: {
        productId: queryProduct,
        tags: { $in: queryTags },
      },
    },
    {
      $project: {
        videoId: 1,
      },
    }
  );
<<<<<<< HEAD
  // IDEA: For each video populate the tags array with the tag names:
=======

  // Populate the tags array:
  // videoAggPipeline.push({
  //   $lookup: {
  //     from: "tags",
  //     localField: "tags",
  //     foreignField: "_id",
  //     as: "tags",
  //   },
  // });
>>>>>>> 1ced6cc0e47acacabd288b1478e5ef30a9e4d43b

  // Get Ranked Videos:
  // Match videos with the product id and atleast one tag:
  rankAggPipeline.push(
    {
      $match: {
        productSelected: queryProduct,
        tagsSelected: { $in: queryTags },
      },
    },
    // Select only videosWatched:
    {
      $project: {
        _id: 0,
        videosWatched: 1,
      },
    }
  );

  // Unwind videosWatched array:
  rankAggPipeline.push({
    $unwind: "$videosWatched",
  });

  // Group by videoId and calculate average completion ratio, avg watch time and helpfulness ratio:
  rankAggPipeline.push({
    $group: {
      _id: "$videosWatched.videoId",
      avgCompletionRatio: {
        $avg: "$videosWatched.completionRatio",
      },
      avgWatchTime: {
        $avg: "$videosWatched.watchTime",
      },
      helpfulnessRatio: {
        $avg: {
          $cond: {
            if: "$videosWatched.wasHelpful",
            then: 1,
            else: 0,
          },
        },
      },
      noOfTagsMatched: {
        $sum: {
          $cond: {
            if: {
              $in: ["$videosWatched.tags", queryTags],
            },
            then: 1,
            else: 0,
          },
        },
      },
    },
  });

  // Filter out videos with noOfTagsMatched = 0:
  rankAggPipeline.push({
    $match: {
      noOfTagsMatched: { $gt: 0 },
    },
  });

  // Sort by noOfTagsMatched, avgWatchTime,avgCompletionRatio, helpfulnessRatio:
  rankAggPipeline.push({
    $sort: {
      noOfTagsMatched: -1,
      avgCompletionRatio: -1,
      helpfulnessRatio: -1,
      avgWatchTime: -1,
    },
  });

  return { videoAggPipeline, rankAggPipeline };
};
