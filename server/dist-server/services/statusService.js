import client from "../lib/gowaClient";
export const getStatus = async () => {
    const r = await client.get("/app/status");
    return r.data;
};
export const getDevices = async () => {
    const r = await client.get("/app/devices");
    return r.data;
};
