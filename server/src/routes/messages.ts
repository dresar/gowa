import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import { 
  sendTextHandler, 
  sendImageHandler,
  sendVideoHandler,
  sendDocumentHandler,
  sendAudioHandler,
  sendStickerHandler,
  sendLinkHandler, 
  sendPresenceHandler, 
  sendChatPresenceHandler, 
  revokeMessageHandler, 
  deleteMessageHandler, 
  reactToMessageHandler, 
  editMessageHandler, 
  starMessageHandler, 
  readMessageHandler, 
  downloadMediaHandler 
} from "../controllers/messagesController";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

router.post("/send/message", requireAuth, sendTextHandler);
router.post("/send/image", requireAuth, upload.single("image"), sendImageHandler);
router.post("/send/video", requireAuth, upload.single("file"), sendVideoHandler);
router.post("/send/document", requireAuth, upload.single("file"), sendDocumentHandler);
router.post("/send/audio", requireAuth, upload.single("file"), sendAudioHandler);
router.post("/send/sticker", requireAuth, upload.single("image"), sendStickerHandler);
router.post("/send/link", requireAuth, sendLinkHandler);
router.post("/send/presence", requireAuth, sendPresenceHandler);
router.post("/send/chat-presence", requireAuth, sendChatPresenceHandler);

router.post("/message/revoke", requireAuth, revokeMessageHandler);
router.post("/message/delete", requireAuth, deleteMessageHandler);
router.post("/message/react", requireAuth, reactToMessageHandler);
router.post("/message/update", requireAuth, editMessageHandler);
router.post("/message/star", requireAuth, starMessageHandler);
router.post("/message/read", requireAuth, readMessageHandler);
router.get("/message/:messageId/download", requireAuth, downloadMediaHandler);

export default router;
