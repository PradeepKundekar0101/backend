import Video, { IVideo } from "../models/video";

class VideoService {

  async createVideo(videoData: IVideo): Promise<IVideo> {
    const video = await Video.create(videoData);
    return video;
  }

  async getVideosByProductId(productId:string): Promise<IVideo[]> {
    const videos = await Video.find({productId});
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

}

export default new VideoService();
