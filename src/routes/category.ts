import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category";
import { upload } from "../config/multerupload";

const router = Router();

// Category routes:
router.post("/",upload.single("image"),createCategory);
router.get("/", getAllCategories);
router.get("/:categoryId", getCategoryById);
router.patch("/:categoryId",upload.single("image"),updateCategory);
router.delete("/:categoryId", deleteCategory);

export default router;
