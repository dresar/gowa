import { sendTextMessage, sendLink, revokeMessage, deleteMessage, reactToMessage, editMessage, starMessage } from "../services/messagesService";
import { ok, badRequest, serverError } from "../utils/response";
export const sendTextHandler = async (req, res) => {
    try {
        const { phone, message, reply_message_id, mentions, mention_everyone } = req.body || {};
        if (!phone || !message) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await sendTextMessage({ phone, message, reply_message_id, mentions, mention_everyone });
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const sendLinkHandler = async (req, res) => {
    try {
        const { phone, url, caption } = req.body || {};
        if (!phone || !url) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await sendLink({ phone, url, caption });
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const revokeMessageHandler = async (req, res) => {
    try {
        const { phone, message_id } = req.body || {};
        if (!phone || !message_id) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await revokeMessage({ phone, message_id });
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const deleteMessageHandler = async (req, res) => {
    try {
        const { phone, message_id } = req.body || {};
        if (!phone || !message_id) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await deleteMessage({ phone, message_id });
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const reactToMessageHandler = async (req, res) => {
    try {
        const { phone, message_id, emoji } = req.body || {};
        if (!phone || !message_id || !emoji) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await reactToMessage({ phone, message_id, emoji });
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const editMessageHandler = async (req, res) => {
    try {
        const { phone, message_id, message } = req.body || {};
        if (!phone || !message_id || !message) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await editMessage({ phone, message_id, message });
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
export const starMessageHandler = async (req, res) => {
    try {
        const { phone, message_id, star } = req.body || {};
        if (!phone || !message_id || star === undefined) {
            badRequest(res, "missing_fields");
            return;
        }
        const data = await starMessage({ phone, message_id, star });
        ok(res, data);
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
