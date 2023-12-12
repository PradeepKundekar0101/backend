import { Router } from "express";
import { responseInterceptor } from "../middlewares/logger";
import { createAnalytics } from "../controllers/analytics";

const router = Router();

// Middlewares:
router.use(responseInterceptor);

// Routes:
router.post("/", createAnalytics);
export default router;
