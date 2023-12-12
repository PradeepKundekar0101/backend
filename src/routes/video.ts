import { Router } from "express";
import { responseInterceptor } from "../middlewares/logger";
import {
  createVideos,
  deleteVideo,
  getAllVideos,
  getAllVideosByProductId,
  getVideoById,
  getVideosSuggestions,
} from "../controllers/video";

const router = Router();

// Middlewares:
router.use(responseInterceptor);

router.post("/", createVideos);
router.get("/", getAllVideos);
router.get("/suggestions", getVideosSuggestions);
router.get("/:productId", getAllVideosByProductId);
router.delete("/:videoId", deleteVideo);
router.get("/", getAllVideos);
router.get("/:videoId", getVideoById);
router.get("/product/:productId", getAllVideosByProductId);
router.delete("/:videoId", deleteVideo);

export default router;
