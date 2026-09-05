import { Request, Response } from "express";
import { 
  getUserInfo, 
  getUserAvatar, 
  updateUserAvatar, 
  updateUserPushName,
  getMyNewsletters,
  getPrivacySettings,
  checkUser,
  getBusinessProfile
} from "../services/userService";
import { ok, serverError, badRequest } from "../utils/response";

export const userInfoHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    if (!deviceId) return badRequest(res, "missing_device_id");
    const data = await getUserInfo(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const userAvatarHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    if (!deviceId) return badRequest(res, "missing_device_id");
    const data = await getUserAvatar(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const updateAvatarHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    const { avatar } = req.body;
    if (!deviceId) return badRequest(res, "missing_device_id");
    if (!avatar) return badRequest(res, "missing_avatar");
    const data = await updateUserAvatar(deviceId, avatar);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const updatePushNameHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    const { pushname } = req.body;
    if (!deviceId) return badRequest(res, "missing_device_id");
    if (!pushname) return badRequest(res, "missing_pushname");
    const data = await updateUserPushName(deviceId, pushname);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const myNewslettersHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    if (!deviceId) return badRequest(res, "missing_device_id");
    const data = await getMyNewsletters(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const privacySettingsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    if (!deviceId) return badRequest(res, "missing_device_id");
    const data = await getPrivacySettings(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const checkUserHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    const { phone } = req.query;
    if (!deviceId) return badRequest(res, "missing_device_id");
    if (!phone) return badRequest(res, "missing_phone");
    const data = await checkUser(deviceId, phone as string);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const businessProfileHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    const { phone } = req.query;
    if (!deviceId) return badRequest(res, "missing_device_id");
    if (!phone) return badRequest(res, "missing_phone");
    const data = await getBusinessProfile(deviceId, phone as string);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};
