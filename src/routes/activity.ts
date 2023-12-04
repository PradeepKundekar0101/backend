import { Router } from "express";
import { responseInterceptor } from "../middlewares/logger";
import {
  getActivitiesController,
  createActivityController,
} from "../controllers/activity";

const router = Router();

// Middlewares:
router.use(responseInterceptor);
// GET:
router.get("/", getActivitiesController);

// POST:
router.post("/", createActivityController);

export default router;
