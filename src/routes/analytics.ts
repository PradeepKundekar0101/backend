import { Router } from "express";
import { responseInterceptor } from "../middlewares/logger";
import {
  createAnalytics,
  getVideosSuggestions,
} from "../controllers/analytics";

const router = Router();

// Middlewares:
router.use(responseInterceptor);

// Routes:
router.post("/", createAnalytics);
router.get("/suggestions", getVideosSuggestions);

export default router;
