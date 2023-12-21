import { Router } from "express";
import { responseInterceptor } from "../middlewares/logger";
import {
  createHelpDesk,
  getAllHelpDesk,
  getHelpDeskById,
  updateHelpDesk,
  deleteHelpDesk,
} from "../controllers/helpdesk";

const router = Router();

// Middlewares:
router.use(responseInterceptor);

router.post("/", createHelpDesk);
router.get("/", getAllHelpDesk);
router.get("/:helpdeskId", getHelpDeskById);
router.patch("/:helpdeskId", updateHelpDesk);
router.delete("/:helpdeskId", deleteHelpDesk);

export default router;
