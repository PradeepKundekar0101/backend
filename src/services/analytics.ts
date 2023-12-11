import AppError from "../utils/AppError";
import Analytics, { IAnalytics } from "../models/analytics";
import mongoose, { PipelineStage } from "mongoose";
import Video from "../models/video";

class AnalyticsServices {
  async createAnalytics(analyticsData: IAnalytics): Promise<IAnalytics> {
    const analytics = await Analytics.create(analyticsData);
    return analytics;
  }

  async getVideosSuggestions(productId: string, tags: string[]): Promise<any> {
    const videoAggPipeline: PipelineStage[] = [];

    const queryProduct = new mongoose.Types.ObjectId(productId);
    const queryTags = tags.map((tag) => new mongoose.Types.ObjectId(tag));

    // Match videos with the product id and atleast one tag:
    videoAggPipeline.push({
      $match: {
        productId: queryProduct,
        tags: { $in: queryTags },
      },
    });

    // Populate the tags array:
    videoAggPipeline.push({
      $lookup: {
        from: "tags",
        localField: "tags",
        foreignField: "_id",
        as: "tags",
      },
    });

    // Get Ranked Videos:
    const rankAggPipeline: PipelineStage[] = [];

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

    // Group by videoId and calculate average completion ratio:
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
      },
    });

    // Get the tags array from video details:
    rankAggPipeline.push(
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      // Unwind videoDetails array:
      {
        $unwind: "$videoDetails",
      },
      {
        $project: {
          _id: 1,
          avgCompletionRatio: 1,
          avgWatchTime: 1,
          helpfulnessRatio: 1,
          tags: "$videoDetails.tags",
        },
      }
    );

    // Calculate the no of tags matched:
    rankAggPipeline.push(
      {
        $addFields: {
          noOfTagsMatched: {
            $size: {
              $setIntersection: ["$tags", queryTags],
            },
          },
        },
      },
      // Remove the tags array:
      {
        $project: {
          tags: 0,
        },
      }
    );

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
        avgWatchTime: -1,
        avgCompletionRatio: -1,
        helpfulnessRatio: -1,
      },
    });

    // Merge the rankedVideos array with the videos array:
    const rankedVideos = await Analytics.aggregate(rankAggPipeline);

    const videos = await Video.aggregate(videoAggPipeline);

    const rankIndexMap = new Map<string, number>();

    rankedVideos.forEach((video, index) => {
      rankIndexMap.set(video._id.toString(), index);
    });

    videos.sort((itemA, itemB) => {
      const indexA = rankIndexMap.get(itemA._id.toString());
      const indexB = rankIndexMap.get(itemB._id.toString());

      if (indexA === undefined && indexB === undefined) return 0;
      if (indexA === undefined) return 1;
      if (indexB === undefined) return -1;

      return indexA - indexB;
    });

    console.log(videos.map((video) => video._id.toString()));

    return videos;
  }
}

export default new AnalyticsServices();
