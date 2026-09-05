import { Request, Response } from "express";
import { getChats, getChatMessages, setChatLabel, setChatPin, setChatMute, setChatArchive, deleteChat, clearChat } from "../services/chatsService";
import { ok, badRequest, serverError } from "../utils/response";

export const chatsHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = (req.headers["x-device-id"] as string) || (req.query.device_id as string);
    console.log(`[Chats Controller] Fetching chats for device: ${deviceId}`);
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const data = await getChats(deviceId, page, limit);
    ok(res, data);
  } catch (e: any) {
    console.error("Error in chatsHandler:", e.message);
    if (e.response) {
      console.error("GoWA Error Response Data:", JSON.stringify(e.response.data, null, 2));
      console.error("GoWA Error Response Status:", e.response.status);
    }
    const errorMessage = e.response?.data?.message || e.response?.data?.error || e.message || "Unknown error";
    serverError(res, errorMessage);
  }
};

export const chatMessagesHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = (req.headers["x-device-id"] as string) || (req.query.device_id as string);
    const { jid } = req.params;
    if (!jid) {
      badRequest(res, "missing_jid");
      return;
    }
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const start_time = req.query.start_time ? String(req.query.start_time) : undefined;
    const end_time = req.query.end_time ? String(req.query.end_time) : undefined;
    const data = await getChatMessages(deviceId, jid, { page, limit, start_time, end_time });
    ok(res, data);
  } catch (e: any) {
    console.error("Error in chatMessagesHandler:", e);
    const errorMessage = e.response?.data?.message || e.message || "Unknown error";
    serverError(res, errorMessage);
  }
};

export const setChatLabelHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { jid } = req.params;
    const { labels } = req.body;
    const data = await setChatLabel(deviceId, jid, labels);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const setChatPinHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { jid } = req.params;
    const { pin } = req.body;
    const data = await setChatPin(deviceId, jid, pin);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const setChatMuteHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { jid } = req.params;
    const { mute, duration } = req.body;
    const data = await setChatMute(deviceId, jid, mute, duration);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const setChatArchiveHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { jid } = req.params;
    const { archive } = req.body;
    const data = await setChatArchive(deviceId, jid, archive);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const deleteChatHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { jid } = req.params;
    const data = await deleteChat(deviceId, jid);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const clearChatHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { jid } = req.params;
    const data = await clearChat(deviceId, jid);
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

