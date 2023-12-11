import { Router } from "express";
import { responseInterceptor } from "../middlewares/logger";
import {createProduct,deleteProduct,getAllProducts, getProductById, updateProduct, updateProductWithTags} from "../controllers/product";

const router = Router();

router.use(responseInterceptor);

//Product routes
router.post("/", createProduct);
router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.patch("/:productId",updateProduct)
router.patch("/:productId/tags", updateProductWithTags);
router.delete("/:productId", deleteProduct);

export default router;
