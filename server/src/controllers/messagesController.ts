import { Request, Response } from "express";
import { 
  sendTextMessage, 
  sendImage,
  sendVideo,
  sendDocument,
  sendAudio,
  sendSticker,
  sendLink, 
  sendPresence, 
  sendChatPresence, 
  revokeMessage, 
  deleteMessage, 
  reactToMessage, 
  editMessage, 
  starMessage, 
  readMessage, 
  downloadMedia 
} from "../services/messagesService";
import { ok, badRequest, serverError } from "../utils/response";

export const sendTextHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, message, reply_message_id, mentions, mention_everyone } = req.body || {};
    if (!phone || !message) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await sendTextMessage(deviceId, { phone, message, reply_message_id, mentions, mention_everyone });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const sendImageHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const file = req.file;
    const { phone, caption, view_once, compress, reply_message_id, mentions, mention_everyone } = req.body || {};
    
    console.log(`[sendImageHandler] deviceId: ${deviceId}, phone: ${phone}, hasFile: ${!!file}`);
    if (file) {
      console.log(`[sendImageHandler] File details: fieldname=${file.fieldname}, originalname=${file.originalname}`);
    }

    if (!phone || !file) {
      console.warn(`[sendImageHandler] Validation failed: phone=${phone}, file=${!!file}`);
      badRequest(res, !phone ? "missing_phone" : "missing_file");
      return;
    }

    const data = await sendImage(deviceId, file, {
      phone,
      caption,
      view_once: view_once === 'true',
      compress: compress === 'true',
      reply_message_id,
      mentions,
      mention_everyone: mention_everyone === 'true'
    });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const sendVideoHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const file = req.file;
    const { phone, caption, view_once, compress, reply_message_id, mentions, mention_everyone } = req.body || {};
    
    console.log(`[sendVideoHandler] deviceId: ${deviceId}, phone: ${phone}, hasFile: ${!!file}`);

    if (!phone || !file) {
      badRequest(res, !phone ? "missing_phone" : "missing_file");
      return;
    }

    const data = await sendVideo(deviceId, file, { 
      phone, 
      caption, 
      view_once: view_once === 'true', 
      compress: compress === 'true',
      reply_message_id,
      mentions,
      mention_everyone: mention_everyone === 'true'
    });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const sendDocumentHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const file = req.file;
    const { phone, caption, reply_message_id, mentions, mention_everyone } = req.body || {};
    
    console.log(`[sendDocumentHandler] deviceId: ${deviceId}, phone: ${phone}, hasFile: ${!!file}`);

    if (!phone || !file) {
      badRequest(res, !phone ? "missing_phone" : "missing_file");
      return;
    }

    const data = await sendDocument(deviceId, file, { 
      phone, 
      caption,
      reply_message_id,
      mentions,
      mention_everyone: mention_everyone === 'true'
    });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const sendAudioHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const file = req.file;
    const { phone, ptt, reply_message_id } = req.body || {};
    
    console.log(`[sendAudioHandler] deviceId: ${deviceId}, phone: ${phone}, hasFile: ${!!file}`);

    if (!phone || !file) {
      badRequest(res, !phone ? "missing_phone" : "missing_file");
      return;
    }

    const data = await sendAudio(deviceId, file, { 
      phone, 
      ptt: ptt === 'true',
      reply_message_id
    });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const sendStickerHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const file = req.file;
    const { phone, reply_message_id } = req.body || {};
    
    console.log(`[sendStickerHandler] deviceId: ${deviceId}, phone: ${phone}, hasFile: ${!!file}`);

    if (!phone || !file) {
      badRequest(res, !phone ? "missing_phone" : "missing_file");
      return;
    }

    const data = await sendSticker(deviceId, file, { 
      phone,
      reply_message_id
    });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const sendLinkHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, url, caption } = req.body || {};
    if (!phone || !url) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await sendLink(deviceId, { phone, url, caption });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const sendPresenceHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { presence } = req.body || {};
    if (!presence) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await sendPresence(deviceId, { presence });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const sendChatPresenceHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, presence } = req.body || {};
    if (!phone || !presence) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await sendChatPresence(deviceId, { phone, presence });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const revokeMessageHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, message_id } = req.body || {};
    if (!phone || !message_id) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await revokeMessage(deviceId, { phone, message_id });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const deleteMessageHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, message_id } = req.body || {};
    if (!phone || !message_id) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await deleteMessage(deviceId, { phone, message_id });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const reactToMessageHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, message_id, emoji } = req.body || {};
    if (!phone || !message_id || !emoji) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await reactToMessage(deviceId, { phone, message_id, emoji });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const editMessageHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, message_id, message } = req.body || {};
    if (!phone || !message_id || !message) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await editMessage(deviceId, { phone, message_id, message });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const starMessageHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, message_id, star } = req.body || {};
    if (!phone || !message_id || star === undefined) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await starMessage(deviceId, { phone, message_id, star });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const readMessageHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { phone, message_id } = req.body || {};
    if (!phone || !message_id) {
      badRequest(res, "missing_fields");
      return;
    }
    const data = await readMessage(deviceId, { phone, message_id });
    ok(res, data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};

export const downloadMediaHandler = async (req: Request, res: Response) => {
  try {
    const deviceId = req.headers["x-device-id"] as string;
    const { messageId } = req.params;
    if (!messageId) {
      badRequest(res, "missing_message_id");
      return;
    }
    const data = await downloadMedia(deviceId, messageId);
    res.send(data);
  } catch (e: any) {
    serverError(res, e.message || "error");
  }
};
