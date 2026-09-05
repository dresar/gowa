import { readJSON, writeJSON } from "../utils/jsonFile";
import { autoReplyFile } from "../config/storage";
import { AutoReplyConfig, AutoReplyRule, AutoReplySettings } from "../models/autoReply";
import crypto from "crypto";

const defaultSettings: AutoReplySettings = {
  globalEnabled: true,
  disabledDevices: [],
  disabledNumbers: []
};

export const getConfig = (): AutoReplyConfig => {
  return readJSON<AutoReplyConfig>(autoReplyFile, { rules: [], settings: defaultSettings });
};

export const updateSettings = (settings: Partial<AutoReplySettings>): AutoReplySettings => {
  const config = getConfig();
  config.settings = { ...config.settings, ...settings };
  writeJSON(autoReplyFile, config);
  return config.settings;
};

export const addRule = (contains: string, reply: string): AutoReplyRule => {
  const config = getConfig();
  const rule: AutoReplyRule = { id: crypto.randomUUID(), contains, reply };
  config.rules.push(rule);
  writeJSON(autoReplyFile, config);
  return rule;
};

export const removeRule = (id: string) => {
  const config = getConfig();
  config.rules = config.rules.filter((r) => r.id !== id);
  writeJSON(autoReplyFile, config);
};

export const matchReply = (text?: string, deviceId?: string, fromNumber?: string): string | null => {
  if (!text) return null;
  const config = getConfig();
  
  // 1. Check Global
  if (!config.settings.globalEnabled) return null;

  // 2. Check Device
  if (deviceId && config.settings.disabledDevices.includes(deviceId)) return null;

  // 3. Check Number
  if (fromNumber) {
    // Normalize number (remove @s.whatsapp.net etc)
    const phone = fromNumber.split('@')[0];
    if (config.settings.disabledNumbers.includes(phone)) return null;
  }

  // 4. Match Rules
  for (const r of config.rules) {
    if (text.toLowerCase().includes(r.contains.toLowerCase())) return r.reply;
  }
  return null;
};

