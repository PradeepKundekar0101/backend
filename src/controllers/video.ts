import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";
import videoService from "../services/video";

//Create Videos
export const createVideos = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { videos } = req.body;
      if (videos.length==0) {
        return next(new AppError(400, "Please provide atleast one video"));
      }
      let response =[];
      for(const video of videos)
      {
            response.push(await videoService.createVideo(video));
      }
      sendResponse(res, 201, { response });
    }
  );


// Create a new single video:
export const createVideo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { videoId, productId,tags } = req.body;
    if (!videoId || !productId || !tags) {
      return next(new AppError(400, "Please videoId productId and tags"));
    }
    const video = await videoService.createVideo(req.body);
    sendResponse(res, 201, { video });
  }
);

//Delete a Video
export const deleteVideo = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const {videoId} = req.params;
      if (!videoId) {
        return next(new AppError(400, "Please videoId"));
      }
      const video = await videoService.deleteVideo(videoId);
      if (!video) {
        return next(
          new AppError(404, `Video with id ${video} not found`)
        );
      }
      res.status(204).json({video});
    }
  );

//List all Videos
export const getAllVideos = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const videos = await videoService.getAllVideos();
      sendResponse(res, 200, { videos });
    }
);

//Get all Videos related to a Product
export const getAllVideosByProductId = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const {productId } = req.params;
      if (!productId ) {
        return next(new AppError(400, "Please productId"));
      }
      const videos = await videoService.getVideosByProductId(productId);
      sendResponse(res, 200, { videos });
    }
);
  