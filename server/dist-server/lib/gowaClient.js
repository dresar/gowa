import axios from "axios";
import { getSettings } from "../services/settingsService";
const client = axios.create({
    headers: { "Content-Type": "application/json" },
});
client.interceptors.request.use((config) => {
    const { base_url, username, password, device_id } = getSettings();
    const basic = Buffer.from(`${username}:${password}`).toString("base64");
    config.headers = config.headers || {};
    config.headers.Authorization = `Basic ${basic}`;
    if (device_id)
        config.headers["X-Device-Id"] = device_id;
    config.baseURL = base_url || config.baseURL;
    return config;
});
export default client;
