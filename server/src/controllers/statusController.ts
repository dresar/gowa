import { Request, Response } from "express";
import { getStatus, getDevices, appLogin, appLoginWithCode, appLogout, appReconnect } from "../services/statusService";
import { ok, serverError, badRequest } from "../utils/response";

export const statusHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    const data = await getStatus(deviceId);
    ok(res, data);
  } catch (e: any) {
    // Return partial success if status fails (e.g. device not set)
    ok(res, { 
      online: false, 
      error: e.response?.data?.message || e.message || "error",
      code: e.response?.data?.code
    });
  }
};

export const devicesHandler = async (_: Request, res: Response) => {
  try {
    const data = await getDevices();
    ok(res, data);
  } catch (e: any) {
    ok(res, { 
      results: [], 
      error: e.response?.data?.message || e.message || "error" 
    });
  }
};

export const appLoginHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    if (!deviceId) return badRequest(res, "missing_device_id");
    const data = await appLogin(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const appLoginWithCodeHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    if (!deviceId) return badRequest(res, "missing_device_id");
    const data = await appLoginWithCode(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const appLogoutHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    if (!deviceId) return badRequest(res, "missing_device_id");
    const data = await appLogout(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};

export const appReconnectHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.header("X-Device-Id");
    if (!deviceId) return badRequest(res, "missing_device_id");
    const data = await appReconnect(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.response?.data?.message || e.message || "error");
  }
};
