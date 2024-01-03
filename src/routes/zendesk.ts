import { Router } from "express";
import { createTicket } from "../controllers/zendesk";

const router = Router();

router.post("/create-ticket", createTicket);

export default router;
