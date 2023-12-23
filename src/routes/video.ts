import { Router } from "express";
import {
  createVideos,
  deleteVideo,
  getAllVideos,
  getAllVideosByProductId,
  getVideoById,
  getVideosSuggestions,
} from "../controllers/video";

const router = Router();

router.post("/", createVideos);
router.get("/", getAllVideos);
router.get("/suggestions", getVideosSuggestions);
router.get("/product/:productId", getAllVideosByProductId);
router.get("/:videoId", getVideoById);
router.delete("/:videoId", deleteVideo);

export default router;
