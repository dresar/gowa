import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { newslettersHandler, unfollowNewsletterHandler } from "../controllers/newsletterController";
const router = Router();
router.get("/newsletter", requireAuth, newslettersHandler);
router.post("/newsletter/:newsletterId/unfollow", requireAuth, unfollowNewsletterHandler);
export default router;
