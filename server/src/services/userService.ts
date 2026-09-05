import client from "../lib/gowaClient";

export const getUserInfo = async (deviceId: string) => {
  const r = await client.get("/user/info", {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const getUserAvatar = async (deviceId: string) => {
  const r = await client.get("/user/avatar", {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const updateUserAvatar = async (deviceId: string, avatar: string) => {
  const r = await client.post("/user/avatar", { avatar }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const updateUserPushName = async (deviceId: string, pushname: string) => {
  const r = await client.post("/user/pushname", { pushname }, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const getMyNewsletters = async (deviceId: string) => {
  const r = await client.get("/user/my/newsletters", {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const getPrivacySettings = async (deviceId: string) => {
  const r = await client.get("/user/my/privacy", {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const checkUser = async (deviceId: string, phone: string) => {
  const r = await client.get("/user/check", {
    params: { device_id: deviceId, phone },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const getBusinessProfile = async (deviceId: string, phone: string) => {
  const r = await client.get("/user/business-profile", {
    params: { device_id: deviceId, phone },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};
