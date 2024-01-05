import { Router } from "express";
import {
  createHelpDesk,
  getAllHelpDesk,
  getHelpDeskById,
  updateHelpDesk,
  deleteHelpDesk,
} from "../controllers/helpdesk";
import { upload } from "../config/multerupload";

const router = Router();


router.post("/",upload.single("image"), createHelpDesk);
router.get("/", getAllHelpDesk);
router.get("/:helpdeskId", getHelpDeskById);
router.patch("/:helpdeskId",upload.single("image"), updateHelpDesk);
router.delete("/:helpdeskId", deleteHelpDesk);

export default router;
