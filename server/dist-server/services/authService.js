import { env } from "../config/env";
import { readJSON, writeJSON, deleteFile } from "../utils/jsonFile";
import { sessionFile, autoReplyFile, webhookEventsFile, devicesFile, groupsFile, messagesFile } from "../config/storage";
export const getSession = () => {
    return readJSON(sessionFile, { authenticated: false, deviceId: null });
};
export const login = (username, password) => {
    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD)
        return false;
    const s = { authenticated: true, username, deviceId: null };
    writeJSON(sessionFile, s);
    return true;
};
export const logout = () => {
    writeJSON(sessionFile, { authenticated: false, deviceId: null });
    deleteFile(autoReplyFile);
    deleteFile(webhookEventsFile);
    deleteFile(devicesFile);
    deleteFile(groupsFile);
    deleteFile(messagesFile);
};
export const setDevice = (deviceId) => {
    const s = getSession();
    const next = { ...s, deviceId };
    writeJSON(sessionFile, next);
    return next;
};
