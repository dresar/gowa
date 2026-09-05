import client from "../lib/gowaClient";

export const getChats = async (deviceId: string, page?: number, limit?: number) => {
  const r = await client.get("/chats", { 
    params: { device_id: deviceId, page, limit },
    // Try only query param, no header
    headers: { "X-Device-Id": "" } 
  });
  return r.data;
};

export const getChatMessages = async (deviceId: string, jid: string, params?: { page?: number; limit?: number; start_time?: string; end_time?: string }) => {
  const r = await client.get(`/chat/${jid}/messages`, { 
    params: { ...params },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const setChatLabel = async (deviceId: string, jid: string, labels: string[]) => {
  const r = await client.post(`/chat/${jid}/label`, { labels }, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const setChatPin = async (deviceId: string, jid: string, pin: boolean) => {
  const r = await client.post(`/chat/${jid}/pin`, { pin }, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const setChatMute = async (deviceId: string, jid: string, mute: boolean, duration?: number) => {
  const r = await client.post(`/chat/${jid}/mute`, { mute, duration }, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const setChatArchive = async (deviceId: string, jid: string, archive: boolean) => {
  const r = await client.post(`/chat/${jid}/archive`, { archive }, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const deleteChat = async (deviceId: string, jid: string) => {
  const r = await client.delete(`/chat/${jid}/delete`, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const clearChat = async (deviceId: string, jid: string) => {
  const r = await client.delete(`/chat/${jid}/clear`, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

