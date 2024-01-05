import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductWithTags,
} from "../controllers/product";
import { upload } from "../config/multerupload";

const router = Router();

//Product routes
router.post("/",upload.single("image"), createProduct);
router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.patch("/:productId",upload.single("image"), updateProduct);
router.put("/:productId/tags", updateProductWithTags);
router.delete("/:productId", deleteProduct);

export default router;
