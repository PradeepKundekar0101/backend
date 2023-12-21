import { Router } from "express";
import {
  createHelpDesk,
  getAllHelpDesk,
  getHelpDeskById,
  updateHelpDesk,
  deleteHelpDesk,
} from "../controllers/helpdesk";

const router = Router();


router.post("/", createHelpDesk);
router.get("/", getAllHelpDesk);
router.get("/:helpdeskId", getHelpDeskById);
router.patch("/:helpdeskId", updateHelpDesk);
router.delete("/:helpdeskId", deleteHelpDesk);

export default router;
