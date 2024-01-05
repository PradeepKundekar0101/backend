import { Router } from "express";
import {
  createVideos,
  deleteVideo,
  getAllVideos,
  getAllVideosByProductId,
  getVideoById,
  getVideosSuggestions,
  updateVideos
} from "../controllers/video";

const router = Router();

router.post("/", createVideos);
router.put("/",updateVideos);
router.get("/", getAllVideos);
router.post("/suggestions", getVideosSuggestions);
router.get("/product/:productId", getAllVideosByProductId);
router.get("/:videoId", getVideoById);
router.delete("/:videoId", deleteVideo);

export default router;
