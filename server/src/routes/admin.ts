import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { 
  listAutoReplyHandler, 
  addAutoReplyHandler, 
  deleteAutoReplyHandler, 
  listWebhookEventsHandler, 
  clearWebhookEventsHandler,
  getAutoReplySettingsHandler,
  updateAutoReplySettingsHandler
} from "../controllers/adminController";

const router = Router();

router.get("/admin/auto-reply", requireAuth, listAutoReplyHandler);
router.post("/admin/auto-reply", requireAuth, addAutoReplyHandler);
router.delete("/admin/auto-reply/:id", requireAuth, deleteAutoReplyHandler);
router.get("/admin/auto-reply/settings", requireAuth, getAutoReplySettingsHandler);
router.post("/admin/auto-reply/settings", requireAuth, updateAutoReplySettingsHandler);
router.get("/admin/webhook-events", requireAuth, listWebhookEventsHandler);
router.delete("/admin/webhook-events", requireAuth, clearWebhookEventsHandler);

export default router;
