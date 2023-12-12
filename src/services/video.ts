import mongoose, { PipelineStage } from "mongoose";
import Analytics from "../models/analytics";
import Video, { IVideo } from "../models/video";

class VideoService {
  async createVideo(videoData: IVideo): Promise<IVideo> {
    const video = await Video.create(videoData);
    return video;
  }

  async getVideosByProductId(productId: string): Promise<IVideo[]> {
    const videos = await Video.find({ productId });
    return videos;
  }
  async getAllVideos(): Promise<IVideo[]> {
    const videos = await Video.find();
    return videos;
  }

  async deleteVideo(videoId: string): Promise<IVideo | null> {
    const video = await Video.findByIdAndDelete(videoId);
    return video;
  }

  async getVideosSuggestions(productId: string, tags: string[]): Promise<any> {
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

    // Populate the tags array:
    // videoAggPipeline.push({
    //   $lookup: {
    //     from: "tags",
    //     localField: "tags",
    //     foreignField: "_id",
    //     as: "tags",
    //   },
    // });

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

      if (indexA === indexB) return 0;
      if (indexA === undefined) return 1;
      if (indexB === undefined) return -1;

      return indexA - indexB;
    });

    return videos;
  }
}

export default new VideoService();
