import { Router } from "express";
import { 
  userInfoHandler, 
  userAvatarHandler, 
  updateAvatarHandler, 
  updatePushNameHandler,
  myNewslettersHandler,
  privacySettingsHandler,
  checkUserHandler,
  businessProfileHandler
} from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/user/info", requireAuth, userInfoHandler);
router.get("/user/avatar", requireAuth, userAvatarHandler);
router.post("/user/avatar", requireAuth, updateAvatarHandler);
router.post("/user/pushname", requireAuth, updatePushNameHandler);
router.get("/user/my/newsletters", requireAuth, myNewslettersHandler);
router.get("/user/my/privacy", requireAuth, privacySettingsHandler);
router.get("/user/check", requireAuth, checkUserHandler);
router.get("/user/business-profile", requireAuth, businessProfileHandler);

export default router;
