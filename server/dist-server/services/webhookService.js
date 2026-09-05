import { writeJSON, readJSON } from "../utils/jsonFile";
import { webhookEventsFile, storageDir } from "../config/storage";
import { matchReply } from "./autoReplyService";
import { sendTextMessage } from "./messagesService";
import fs from "fs";
import path from "path";
const debugLog = (message, data) => {
    const logFile = path.join(storageDir, "debug.log");
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(logFile, logEntry);
};
const extractPhone = (payload) => {
    if (payload?.sender_id)
        return String(payload.sender_id);
    const jid = payload?.jid || payload?.chat?.jid || payload?.sender?.jid || payload?.from;
    if (!jid)
        return null;
    // Handle JID format: 12345@s.whatsapp.net or 12345:1@s.whatsapp.net
    const str = String(jid);
    // If it contains " in ", it might be "sender in chat", take the first part
    const parts = str.split(' ');
    const senderJid = parts[0];
    // Remove @... and everything after
    const numberPart = senderJid.split('@')[0];
    // Remove :... (device identifier) if present
    const number = numberPart.split(':')[0];
    // Remove any non-digits
    return number.replace(/\D/g, '');
};
const extractText = (payload) => {
    if (payload?.text)
        return String(payload.text);
    if (payload?.message?.text)
        return String(payload.message.text);
    if (payload?.message?.conversation)
        return String(payload.message.conversation);
    if (payload?.message?.extendedTextMessage?.text)
        return String(payload.message.extendedTextMessage.text);
    return undefined;
};
export const handleWebhookEvent = async (body) => {
    debugLog("Received webhook body:", body);
    const events = readJSON(webhookEventsFile, []);
    // Keep only last 50 events to prevent file growing too large
    const next = [...events, body].slice(-50);
    writeJSON(webhookEventsFile, next);
    const event = body?.event || body?.type;
    // Check if it's a message event (either explicit event type or has message structure)
    const isMessage = event === "message" || !!body?.message;
    debugLog("Is message event?", isMessage);
    if (isMessage) {
        const rawText = extractText(body?.payload || body);
        const phone = extractPhone(body?.payload || body);
        debugLog("Extracted data:", { rawText, phone });
        if (phone && rawText) {
            // Ensure text is lowercase for matching (as requested by user)
            // matchReply already handles this, but we'll be explicit
            const reply = matchReply(rawText);
            debugLog("Match reply result:", reply);
            if (reply) {
                try {
                    const result = await sendTextMessage({ phone, message: reply });
                    debugLog("Send message success:", result);
                }
                catch (error) {
                    debugLog("Send message failed:", error.message || error);
                }
            }
        }
        else {
            debugLog("Skipping auto reply: Missing phone or text");
        }
    }
};
