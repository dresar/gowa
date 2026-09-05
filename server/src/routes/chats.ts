import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { chatsHandler, chatMessagesHandler, setChatLabelHandler, setChatPinHandler, setChatMuteHandler, setChatArchiveHandler, deleteChatHandler, clearChatHandler } from "../controllers/chatsController";

const router = Router();

router.get("/chats", requireAuth, chatsHandler);
router.get("/chat/:jid/messages", requireAuth, chatMessagesHandler);
router.post("/chat/:jid/label", requireAuth, setChatLabelHandler);
router.post("/chat/:jid/pin", requireAuth, setChatPinHandler);
router.post("/chat/:jid/mute", requireAuth, setChatMuteHandler);
router.post("/chat/:jid/archive", requireAuth, setChatArchiveHandler);
router.delete("/chat/:jid/delete", requireAuth, deleteChatHandler);
router.delete("/chat/:jid/clear", requireAuth, clearChatHandler);

export default router;

