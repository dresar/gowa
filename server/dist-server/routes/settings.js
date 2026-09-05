import { Router } from "express";
import { getConnectionSettingsHandler, updateConnectionSettingsHandler } from "../controllers/settingsController";
const router = Router();
router.get("/settings/connection", getConnectionSettingsHandler);
router.post("/settings/connection", updateConnectionSettingsHandler);
export default router;
