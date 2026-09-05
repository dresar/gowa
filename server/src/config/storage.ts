import path from "path";

export const storageDir = path.resolve(process.cwd(), "server", "src", "storage");
export const sessionFile = path.join(storageDir, "session.json");
export const autoReplyFile = path.join(storageDir, "autoReply.json");
export const webhookEventsFile = path.join(storageDir, "webhookEvents.json");
export const devicesFile = path.join(storageDir, "devices.json");
export const groupsFile = path.join(storageDir, "groups.json");
export const messagesFile = path.join(storageDir, "messages.json");

