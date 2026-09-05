import { readJSON, writeJSON } from "../utils/jsonFile";
import path from "path";
import { storageDir } from "../config/storage";
import { env } from "../config/env";
const file = path.join(storageDir, "connection.json");
export const getSettings = () => {
    const settings = readJSON(file, {
        base_url: "",
        username: "",
        password: "",
        device_id: "",
    });
    // Use GOWA_BASE_URL from env as default if not set
    if (!settings.base_url) {
        settings.base_url = env.GOWA_BASE_URL;
    }
    return settings;
};
export const setSettings = (data) => {
    const curr = getSettings();
    const next = { ...curr, ...data };
    writeJSON(file, next);
    return next;
};
