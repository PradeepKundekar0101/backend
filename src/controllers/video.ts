import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { catchAsync, sendResponse } from "../utils/api.utils";
import videoService from "../services/video";
import validator from "validator";
import Video, { IVideo } from "../models/video";

//Create Videos
export const createVideos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { videos } = req.body;
    if (!videos || videos.length == 0) {
      return next(new AppError(400, "Please provide atleast one video"));
    }
    let response = [];
    for (const video of videos) {
      response.push(await videoService.createVideo(video));
    }
    sendResponse(res, 201, {videos:response });
  }
);
//Update Videos
export const updateVideos = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { videos } = req.body;
    if (!videos || videos.length == 0) {
      return next(new AppError(400, "Please provide atleast one video"));
    }
    const existingVideos = await videoService.getVideosByProductId(videos[0].productId);


  existingVideos.forEach(async (existingVideo) => {
    const foundVideo = videos.find((video:IVideo) => video.videoId === existingVideo.videoId);
    if (!foundVideo)
    {
      await Video.findByIdAndUpdate(existingVideo._id,  { is_discontinued: true },{ new: true });
    }else{
      await Video.findByIdAndUpdate(existingVideo._id,{tags:foundVideo.tags});

    }
  });
  videos.forEach(async(vid:any)=>{
      const foundVideo = existingVideos.find((video)=>video.videoId===vid.videoId);
      if(!foundVideo){
        await videoService.createVideo(vid);
      }
  })
    sendResponse(res, 201, {videos:"Updated!"});
  }
);

// Create a new single video:
export const createVideo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { videoId, productId, tags } = req.body;
    if (!videoId || !productId || !tags) {
      return next(new AppError(400, "Please videoId, productId and tags"));
    }

    if (tags.length == 0) {
      return next(new AppError(400, "Please provide atleast one tag"));
    }

    const video = await videoService.createVideo(req.body);
    sendResponse(res, 201, { video });
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
    const { productId } = req.params;
    if (!productId) {
      return next(new AppError(400, "Please productId"));
    }
    const videos = await videoService.getVideosByProductId(productId);
    sendResponse(res, 200, { videos });
  }
);

//Get video By ID
export const getVideoById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { videoId } = req.params;
    if (!videoId) {
      return next(new AppError(400, "Please provide videoId"));
    }
    const video = await videoService.getVideoById(videoId);

    if (!video) sendResponse(res, 404, {});
    sendResponse(res, 200, { video });
  }
);

// Get videos suggestions:
export const getVideosSuggestions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, tags } = req.body;

    if (!productId || !tags || tags.length === 0) {
      return next(new AppError(400, "Please provide product id and tags"));
    }

    if (!Array.isArray(tags)) {
      return next(new AppError(400, "Please provide an array of tags"));
    }

    if (!validator.isMongoId(productId)) {
      return next(new AppError(400, "Please provide a valid product id"));
    }

    tags.forEach((tag: string) => {
      if (!validator.isMongoId(tag)) {
        return next(new AppError(400, "Please provide a valid tag id"));
      }
    });

    const videos = await videoService.getVideosSuggestions(productId, tags);

    sendResponse(res, 200, { videos });
  }
);

//Delete a Video
export const deleteVideo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { videoId } = req.params;
    if (!videoId) {
      return next(new AppError(400, "Please provide videoId"));
    }

    const video = await videoService.deleteVideo(videoId);

    if (!video) {
      return next(new AppError(404, `Video with id ${videoId} not found`));
    }
    res.status(204).json({ video });
  }
);
