import { Router } from "express";
import { 
  statusHandler, 
  devicesHandler, 
  appLoginHandler, 
  appLoginWithCodeHandler, 
  appLogoutHandler, 
  appReconnectHandler 
} from "../controllers/statusController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/app/status", requireAuth, statusHandler);
router.get("/app/devices", requireAuth, devicesHandler);
router.get("/app/login", requireAuth, appLoginHandler);
router.get("/app/login-with-code", requireAuth, appLoginWithCodeHandler);
router.get("/app/logout", requireAuth, appLogoutHandler);
router.get("/app/reconnect", requireAuth, appReconnectHandler);

export default router;
