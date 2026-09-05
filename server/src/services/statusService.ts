import client from "../lib/gowaClient";

export const getStatus = async (deviceId?: string) => {
  const r = await client.get("/app/status", {
    params: deviceId ? { device_id: deviceId } : {},
    headers: deviceId ? { "X-Device-Id": deviceId } : {}
  });
  return r.data;
};

export const getDevices = async () => {
  const r = await client.get("/app/devices");
  return r.data;
};

export const appLogin = async (deviceId: string) => {
  const r = await client.get("/app/login", {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const appLoginWithCode = async (deviceId: string) => {
  const r = await client.get("/app/login-with-code", {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const appLogout = async (deviceId: string) => {
  const r = await client.get("/app/logout", {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const appReconnect = async (deviceId: string) => {
  const r = await client.get("/app/reconnect", {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};
