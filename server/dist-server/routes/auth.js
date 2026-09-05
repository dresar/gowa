import { Router } from "express";
import { loginHandler, logoutHandler, sessionHandler, setActiveDeviceHandler } from "../controllers/authController";
const router = Router();
router.post("/login", loginHandler);
router.post("/logout", logoutHandler);
router.get("/session", sessionHandler);
router.post("/device", setActiveDeviceHandler);
export default router;
