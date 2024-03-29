import { Router } from "express";
import {
  createAnalytics,
  getAllCategoryStats,
  getCategoryStatsById,
  getDashboardStats,
  getOverallStats,
  getProductStatsById,
} from "../controllers/analytics";

const router = Router();

// Routes:
router.post("/", createAnalytics);
router.get("/dashboard", getDashboardStats);
router.get("/overall", getOverallStats);
router.get("/category", getAllCategoryStats);
router.get("/category/:categoryId", getCategoryStatsById);
router.get("/product/:productId", getProductStatsById);

export default router;
