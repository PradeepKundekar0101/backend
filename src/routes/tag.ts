import { Router } from "express";
import { getTagById, updateTag } from "../controllers/tag";

const router = Router();

//Product routes
router.get("/:tagId",getTagById);
router.patch("/:tagId", updateTag);

export default router;
