import { getChats, getChatMessages } from "../services/chatsService";
import { ok, badRequest, serverError } from "../utils/response";
export const chatsHandler = async (req, res) => {
    try {
        const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const data = await getChats(page, limit);
        ok(res, data);
    }
    catch (e) {
        console.error("Error in chatsHandler:", e);
        const errorMessage = e.response?.data?.message || e.message || "Unknown error";
        serverError(res, errorMessage);
    }
};
export const chatMessagesHandler = async (req, res) => {
    try {
        const { jid } = req.params;
        if (!jid) {
            badRequest(res, "missing_jid");
            return;
        }
        const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const start_time = req.query.start_time ? String(req.query.start_time) : undefined;
        const end_time = req.query.end_time ? String(req.query.end_time) : undefined;
        const data = await getChatMessages(jid, { page, limit, start_time, end_time });
        ok(res, data);
    }
    catch (e) {
        console.error("Error in chatMessagesHandler:", e);
        const errorMessage = e.response?.data?.message || e.message || "Unknown error";
        serverError(res, errorMessage);
    }
};
