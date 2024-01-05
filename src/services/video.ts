import { Document } from "mongoose";
import Video, { IVideo } from "../models/video";
import Product from "../models/product";
import Analytics from "../models/analytics";
import { videoRankingPipeline } from "./pipelines/video/videoSuggestion";

type IUpdatedVideo = Document<unknown, {}, IVideo>;

class VideoService {
  async createVideo(videoData: IVideo): Promise<IVideo> {
    const video = await Video.create(videoData);

    // Find the product and update the is_active status:
    await Product.findByIdAndUpdate(videoData.productId, {
      is_active: true,
    }).exec();

    return video;
  }

  async getVideosByProductId(productId: string): Promise<IVideo[]> {
    const videos = await Video.find({ productId });
    return videos;
  }

  async getVideoById(videoId: string): Promise<IVideo | null> {
    const video = await Video.findById(videoId);
    return video;
  }

  async getAllVideos(): Promise<IVideo[]> {
    const videos = await Video.find();
    return videos;
  }

  async deleteVideo(videoId: string): Promise<IUpdatedVideo | null> {
    const video = await Video.findByIdAndUpdate(
      videoId,
      { is_discontinued: true },
      { new: true }
    ).exec();

    return video;
  }

  async getVideosSuggestions(productId: string, tags: string[]): Promise<any> {
    const aggPipeline = videoRankingPipeline(productId, tags);
    const rankedVideos = await Analytics.aggregate(aggPipeline.rankAggPipeline);

    const videos = await Video.aggregate(aggPipeline.videoAggPipeline);

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
