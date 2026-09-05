import { Request, Response } from "express";
import { createDevice, listDevices, getDeviceInfo, deleteDevice, loginDevice, loginDeviceWithCode, logoutDevice, reconnectDevice } from "../services/devicesService";
import { getAllDevices, getDeviceById, saveDevice, deleteDeviceLocal, validateDeviceData, isDeviceInSchedule } from "../services/deviceStorageService";
import { ok, badRequest, serverError } from "../utils/response";

export const listLocalDevicesHandler = async (_: Request, res: Response) => {
  try {
    const devices = getAllDevices();
    ok(res, { status: true, results: devices });
  } catch (e: any) {
    serverError(res, e.message);
  }
};

export const saveLocalDeviceHandler = async (req: Request, res: Response) => {
  try {
    const error = validateDeviceData(req.body);
    if (error) {
      badRequest(res, error);
      return;
    }
    const device = saveDevice(req.body);
    ok(res, { status: true, data: device });
  } catch (e: any) {
    serverError(res, e.message);
  }
};

export const deleteLocalDeviceHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteDeviceLocal(id);
    ok(res, { status: deleted });
  } catch (e: any) {
    serverError(res, e.message);
  }
};

export const detectActiveDeviceHandler = async (_: Request, res: Response) => {
  try {
    const devices = getAllDevices();
    const activeDevices = devices.filter(d => d.status === 'active' && isDeviceInSchedule(d));
    
    // Return the first active device in schedule, or null if none
    ok(res, { status: true, data: activeDevices.length > 0 ? activeDevices[0] : null });
  } catch (e: any) {
    serverError(res, e.message);
  }
};

export const listDevicesHandler = async (_: Request, res: Response) => {
  try {
    const data = await listDevices();
    if (data.error) {
      console.warn("[Devices Controller] listDevices returned an error status:", data.error);
    }
    ok(res, data);
  } catch (e: any) {
    console.error("[Devices Controller] Fatal Error in listDevicesHandler:", e);
    serverError(res, e.message || "error");
  }
};

export const getDeviceInfoHandler = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId || deviceId === "undefined") {
      badRequest(res, "device_id_required");
      return;
    }
    const data = await getDeviceInfo(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const createDeviceHandler = async (req: Request, res: Response) => {
  try {
    const { device_id } = req.body || {};
    if (!device_id || device_id === "undefined") {
      badRequest(res, "missing_device_id");
      return;
    }
    const data = await createDevice(device_id);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const deleteDeviceHandler = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId || deviceId === "undefined") {
      badRequest(res, "device_id_required");
      return;
    }
    const data = await deleteDevice(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const loginDeviceHandler = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId || deviceId === "undefined") {
      badRequest(res, "device_id_required");
      return;
    }
    const data = await loginDevice(deviceId);
    
    // Check if the service returned an "Already logged in" mock success
    if (data.message === 'Already logged in') {
      ok(res, data);
      return;
    }
    
    ok(res, data);
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || e.response?.data?.error || e.message || "error";
    
    // Extra safety: handle the error here too if it wasn't caught in service
    if (errorMsg === 'you are already logged in.') {
      ok(res, {
        status: true,
        message: 'Already logged in',
        data: { results: { status: 'CONNECTED' } }
      });
      return;
    }

    console.error(`[Login Error] Device: ${req.params.deviceId}`, e.response?.data || e.message);
    serverError(res, errorMsg);
  }
};

export const loginDeviceWithCodeHandler = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { phone } = req.body || {};
    if (!deviceId || deviceId === "undefined") {
      badRequest(res, "device_id_required");
      return;
    }
    if (!phone) {
      badRequest(res, "missing_phone");
      return;
    }
    const data = await loginDeviceWithCode(deviceId, phone);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const logoutDeviceHandler = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId || deviceId === "undefined") {
      badRequest(res, "device_id_required");
      return;
    }
    const data = await logoutDevice(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const reconnectDeviceHandler = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId || deviceId === "undefined") {
      badRequest(res, "device_id_required");
      return;
    }
    const data = await reconnectDevice(deviceId);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

