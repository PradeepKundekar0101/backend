import { Router } from "express";
import { updateTag } from "../controllers/tag";

const router = Router();

//Product routes
router.patch("/:tagId", updateTag);

export default router;
