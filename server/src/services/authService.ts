import { env } from "../config/env";
import { readJSON, writeJSON, deleteFile } from "../utils/jsonFile";
import { sessionFile, autoReplyFile, webhookEventsFile, devicesFile, groupsFile, messagesFile } from "../config/storage";
import { Session } from "../models/session";

export const getSession = (): Session => {
  return readJSON<Session>(sessionFile, { authenticated: false, deviceId: null });
};

export const login = (username: string, password: string): boolean => {
  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) return false;
  const s: Session = { authenticated: true, username, deviceId: null };
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

export const setDevice = (deviceId: string) => {
  const s = getSession();
  const next: Session = { ...s, deviceId };
  writeJSON(sessionFile, next);
  return next;
};

