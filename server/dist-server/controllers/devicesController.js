import { createDevice, listDevices, getDeviceInfo, deleteDevice, loginDevice, loginDeviceWithCode, logoutDevice, reconnectDevice } from "../services/devicesService";
import { ok, badRequest, serverError } from "../utils/response";
export const listDevicesHandler = async (_, res) => {
    try {
        const data = await listDevices();
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const getDeviceInfoHandler = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const data = await getDeviceInfo(deviceId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const createDeviceHandler = async (req, res) => {
    try {
        const { device_id } = req.body || {};
        if (!device_id) {
            badRequest(res, "missing_device_id");
            return;
        }
        const data = await createDevice(device_id);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const deleteDeviceHandler = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const data = await deleteDevice(deviceId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const loginDeviceHandler = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const data = await loginDevice(deviceId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const loginDeviceWithCodeHandler = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { phone } = req.body || {};
        if (!phone) {
            badRequest(res, "missing_phone");
            return;
        }
        const data = await loginDeviceWithCode(deviceId, phone);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const logoutDeviceHandler = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const data = await logoutDevice(deviceId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const reconnectDeviceHandler = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const data = await reconnectDevice(deviceId);
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
