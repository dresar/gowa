import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { 
  createDeviceHandler, 
  deleteDeviceHandler, 
  loginDeviceHandler, 
  loginDeviceWithCodeHandler, 
  logoutDeviceHandler, 
  reconnectDeviceHandler, 
  listDevicesHandler, 
  getDeviceInfoHandler,
  listLocalDevicesHandler,
  saveLocalDeviceHandler,
  deleteLocalDeviceHandler,
  detectActiveDeviceHandler
} from "../controllers/devicesController";

const router = Router();

router.get("/devices", requireAuth, listDevicesHandler);
router.post("/devices", requireAuth, createDeviceHandler);

// Local device storage routes
router.get("/devices/local", requireAuth, listLocalDevicesHandler);
router.post("/devices/local", requireAuth, saveLocalDeviceHandler);
router.delete("/devices/local/:id", requireAuth, deleteLocalDeviceHandler);
router.get("/devices/detect", requireAuth, detectActiveDeviceHandler);
router.get("/devices/:deviceId", requireAuth, getDeviceInfoHandler);
router.delete("/devices/:deviceId", requireAuth, deleteDeviceHandler);
router.get("/devices/:deviceId/login", requireAuth, loginDeviceHandler);
router.post("/devices/:deviceId/login/code", requireAuth, loginDeviceWithCodeHandler);
router.post("/devices/:deviceId/logout", requireAuth, logoutDeviceHandler);
router.post("/devices/:deviceId/reconnect", requireAuth, reconnectDeviceHandler);

export default router;

