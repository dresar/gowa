import { Router } from "express";
import { statusHandler, devicesHandler } from "../controllers/statusController";
import { requireAuth } from "../middleware/auth";
const router = Router();
router.get("/app/status", requireAuth, statusHandler);
router.get("/app/devices", requireAuth, devicesHandler);
export default router;
