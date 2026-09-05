import { Router } from "express";
import auth from "./auth";
import status from "./status";
import devices from "./devices";
import messages from "./messages";
import groups from "./groups";
import chats from "./chats";
import admin from "./admin";
import webhook from "./webhook";
import newsletter from "./newsletter";
import settings from "./settings";
import user from "./user";
import broadcast from "./broadcast";

const router = Router();

router.use("/auth", auth);
router.use("/", status);
router.use("/", devices);
router.use("/", messages);
router.use("/", groups);
router.use("/", chats);
router.use("/", admin);
router.use("/", webhook);
router.use("/", newsletter);
router.use("/", settings);
router.use("/", user);
router.use("/", broadcast);

export default router;
