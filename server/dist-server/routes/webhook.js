import { Router } from "express";
import { webhookHandler } from "../controllers/webhookController";
const router = Router();
router.post("/webhook", webhookHandler);
export default router;
