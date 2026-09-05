import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { chatsHandler, chatMessagesHandler } from "../controllers/chatsController";
const router = Router();
router.get("/chats", requireAuth, chatsHandler);
router.get("/chat/:jid/messages", requireAuth, chatMessagesHandler);
export default router;
