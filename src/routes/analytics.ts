import { Router } from "express";
import { responseInterceptor } from "../middlewares/logger";
import {
  createAnalytics,
  getAllCategoryStats,
  getCategoryStatsById,
} from "../controllers/analytics";

const router = Router();

// Middlewares:
router.use(responseInterceptor);

// Routes:
router.post("/", createAnalytics);
router.get("/category", getAllCategoryStats);
router.get("/category/:categoryId", getCategoryStatsById);

export default router;
