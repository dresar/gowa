import client from "../lib/gowaClient";
export const sendTextMessage = async (data) => {
    const r = await client.post("/send/message", data);
    return r.data;
};
export const sendLink = async (data) => {
    const r = await client.post("/send/link", data);
    return r.data;
};
export const revokeMessage = async (data) => {
    const r = await client.post("/message/revoke", data);
    return r.data;
};
export const deleteMessage = async (data) => {
    const r = await client.post("/message/delete", data);
    return r.data;
};
export const reactToMessage = async (data) => {
    const r = await client.post("/message/react", data);
    return r.data;
};
export const editMessage = async (data) => {
    const r = await client.post("/message/update", data);
    return r.data;
};
export const starMessage = async (data) => {
    const r = await client.post("/message/star", data);
    return r.data;
};
