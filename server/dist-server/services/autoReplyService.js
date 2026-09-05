import { readJSON, writeJSON } from "../utils/jsonFile";
import { autoReplyFile } from "../config/storage";
import crypto from "crypto";
export const getConfig = () => {
    return readJSON(autoReplyFile, { rules: [] });
};
export const addRule = (contains, reply) => {
    const config = getConfig();
    const rule = { id: crypto.randomUUID(), contains, reply };
    const next = { rules: [...config.rules, rule] };
    writeJSON(autoReplyFile, next);
    return rule;
};
export const removeRule = (id) => {
    const config = getConfig();
    const next = { rules: config.rules.filter((r) => r.id !== id) };
    writeJSON(autoReplyFile, next);
};
export const matchReply = (text) => {
    if (!text)
        return null;
    const config = getConfig();
    for (const r of config.rules) {
        if (text.toLowerCase().includes(r.contains.toLowerCase()))
            return r.reply;
    }
    return null;
};
