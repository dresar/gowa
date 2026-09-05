import client from "../lib/gowaClient";
import { deleteDeviceLocal } from "./deviceStorageService";

export const createDevice = async (device_id: string) => {
  try {
    const r = await client.post("/devices", { device_id });
    return r.data;
  } catch (e: any) {
    const errorMsg = e.response?.data?.message || e.response?.data?.error || e.message;
    
    // If device already exists, consider it a success and return existing info
    if (errorMsg?.includes('already exists') || e.response?.status === 409) {
      console.log(`[Devices Service] Device ${device_id} already exists, returning success.`);
      return { status: true, message: 'Device already exists' };
    }

    console.error(`[Devices Service] Error creating device ${device_id}:`, errorMsg);
    throw new Error(errorMsg);
  }
};

export const listDevices = async () => {
  try {
    const r = await client.get("/devices");
    const devices = r.data?.results || r.data?.data || [];
    
    // If we have devices, try to get detailed info for each to get current status
    if (Array.isArray(devices) && devices.length > 0) {
      const detailedDevices = await Promise.all(
        devices.map(async (dev: any) => {
          const id = dev.device_id || dev.id;
          try {
            const info = await getDeviceInfo(id);
            const detail = info?.results || info?.data || info;
            return { 
              ...dev, 
              ...detail,
              // Ensure status is at the top level and map state to connected
              status: detail?.status || dev.status || (detail?.state === 'logged_in' ? 'CONNECTED' : 'UNKNOWN'),
              connected: detail?.connected || dev.connected || detail?.state === 'logged_in' || detail?.status === 'CONNECTED'
            };
          } catch (e: any) {
            console.warn(`[Devices Service] Could not get detail for device ${id}:`, e.message);
            return {
              ...dev,
              status: dev.status || 'UNKNOWN'
            };
          }
        })
      );
      return { ...r.data, results: detailedDevices };
    }
    
    return r.data || { results: [] };
  } catch (e: any) {
    console.error("[Devices Service] Error listing devices:", e.response?.data || e.message);
    // Return empty list instead of throwing to avoid 500 if the GoWA server is down
    return { status: false, results: [], error: e.message };
  }
};

export const getDeviceInfo = async (deviceId: string) => {
  const r = await client.get(`/devices/${deviceId}`, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const deleteDevice = async (deviceId: string) => {
  try {
    const r = await client.delete(`/devices/${deviceId}`, {
      headers: { "X-Device-Id": deviceId }
    });
    
    // Also cleanup local storage for this device if it exists
    try {
      deleteDeviceLocal(deviceId);
    } catch (localError) {
      console.warn(`[Devices Service] Failed to delete local data for ${deviceId}:`, localError);
    }

    return r.data;
  } catch (e: any) {
    // If device doesn't exist on server, still cleanup locally
    if (e.response?.status === 404) {
      deleteDeviceLocal(deviceId);
    }
    throw e;
  }
};

export const loginDevice = async (deviceId: string) => {
  try {
    // GoWA v8: login per ID is not implemented yet, use /app/login with X-Device-Id header
    const r = await client.get(`/app/login`, {
      headers: { "X-Device-Id": deviceId }
    });
    return r.data;
  } catch (e: any) {
    // If already logged in, return a friendly message instead of 500
    if (e.response?.data?.error === 'you are already logged in.') {
      return {
        status: true,
        message: 'Already logged in',
        data: {
          results: {
            status: 'CONNECTED'
          }
        }
      };
    }
    throw e;
  }
};

export const loginDeviceWithCode = async (deviceId: string, phone: string) => {
  const r = await client.post(`/devices/${deviceId}/login/code`, { phone }, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const logoutDevice = async (deviceId: string) => {
  const r = await client.post(`/devices/${deviceId}/logout`, {}, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const reconnectDevice = async (deviceId: string) => {
  const r = await client.post(`/devices/${deviceId}/reconnect`, {}, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

