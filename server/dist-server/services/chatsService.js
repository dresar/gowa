import client from "../lib/gowaClient";
export const getChats = async (page, limit) => {
    const r = await client.get("/chats", { params: { page, limit } });
    return r.data;
};
export const getChatMessages = async (jid, params) => {
    const r = await client.get(`/chat/${jid}/messages`, { params });
    return r.data;
};
