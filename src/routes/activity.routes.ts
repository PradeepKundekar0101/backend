import { Router } from "express";
import {
  getActivitiesController,
  createActivityController,
} from "../controllers/activity.controller";

const router = Router();

// GET:
router.get("/", getActivitiesController);

// POST:
router.post("/", createActivityController);

export default router;
