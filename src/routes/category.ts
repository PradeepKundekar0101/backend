import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category";

const router = Router();

// Category routes:
router.post("/", createCategory);
router.get("/", getAllCategories);
router.get("/:categoryId", getCategoryById);
router.patch("/:categoryId", updateCategory);
router.delete("/:categoryId", deleteCategory);

export default router;
