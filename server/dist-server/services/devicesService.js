import client from "../lib/gowaClient";
export const createDevice = async (device_id) => {
    const r = await client.post("/devices", { device_id });
    return r.data;
};
export const listDevices = async () => {
    const r = await client.get("/devices");
    return r.data;
};
export const getDeviceInfo = async (deviceId) => {
    const r = await client.get(`/devices/${deviceId}`);
    return r.data;
};
export const deleteDevice = async (deviceId) => {
    const r = await client.delete(`/devices/${deviceId}`);
    return r.data;
};
export const loginDevice = async (deviceId) => {
    const r = await client.get(`/devices/${deviceId}/login`);
    return r.data;
};
export const loginDeviceWithCode = async (deviceId, phone) => {
    const r = await client.post(`/devices/${deviceId}/login/code`, { phone });
    return r.data;
};
export const logoutDevice = async (deviceId) => {
    const r = await client.post(`/devices/${deviceId}/logout`);
    return r.data;
};
export const reconnectDevice = async (deviceId) => {
    const r = await client.post(`/devices/${deviceId}/reconnect`);
    return r.data;
};
