import mongoose, { PipelineStage } from "mongoose";
import Video, { IVideo } from "../models/video";
import Analytics from "../models/analytics";
import { videoRankingPipeline } from "./pipelines/video/videoSuggestion";

class VideoService {
  async createVideo(videoData: IVideo): Promise<IVideo> {
    const video = await Video.create(videoData);
    return video
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

  async deleteVideo(videoId: string): Promise<IVideo | null> {
    const result = await Video.findByIdAndDelete(videoId);
    if (!result) return null;
    const video: IVideo = {...result.toObject(), _id: result._id.toString()};
    return video;
  }
  

  async getVideosSuggestions(productId: string, tags: string[]): Promise<any> {
    // Merge the rankedVideos array with the videos array:
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
