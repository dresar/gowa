import client from "../lib/gowaClient";
import FormData from "form-data";

export const sendTextMessage = async (deviceId: string, data: {
  phone: string;
  message: string;
  reply_message_id?: string;
  mentions?: string[];
  mention_everyone?: boolean;
}) => {
  const r = await client.post("/send/message", data, {
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const sendImage = async (deviceId: string, file: Express.Multer.File, data: { phone: string; caption?: string; view_once?: boolean; compress?: boolean; reply_message_id?: string; mentions?: string[]; mention_everyone?: boolean }) => {
  const formData = new FormData();
  formData.append("phone", data.phone);
  formData.append("image", file.buffer, { filename: file.originalname, contentType: file.mimetype });
  if (data.caption) formData.append("caption", data.caption);
  if (data.view_once !== undefined) formData.append("view_once", data.view_once.toString());
  if (data.compress !== undefined) formData.append("compress", data.compress.toString());
  if (data.reply_message_id) formData.append("reply_message_id", data.reply_message_id);
  if (data.mentions) formData.append("mentions", typeof data.mentions === 'string' ? data.mentions : JSON.stringify(data.mentions));
  if (data.mention_everyone !== undefined) formData.append("mention_everyone", data.mention_everyone.toString());

  const r = await client.post("/send/image", formData, {
    headers: { 
      ...formData.getHeaders(),
      "X-Device-Id": deviceId 
    }
  });
  return r.data;
};

export const sendVideo = async (deviceId: string, file: Express.Multer.File, data: { phone: string; caption?: string; view_once?: boolean; compress?: boolean; reply_message_id?: string; mentions?: string[]; mention_everyone?: boolean }) => {
  const formData = new FormData();
  formData.append("phone", data.phone);
  formData.append("video", file.buffer, { filename: file.originalname, contentType: file.mimetype });
  if (data.caption) formData.append("caption", data.caption);
  if (data.view_once !== undefined) formData.append("view_once", data.view_once.toString());
  if (data.compress !== undefined) formData.append("compress", data.compress.toString());
  if (data.reply_message_id) formData.append("reply_message_id", data.reply_message_id);
  if (data.mentions) formData.append("mentions", typeof data.mentions === 'string' ? data.mentions : JSON.stringify(data.mentions));
  if (data.mention_everyone !== undefined) formData.append("mention_everyone", data.mention_everyone.toString());

  const r = await client.post("/send/video", formData, {
    headers: { 
      ...formData.getHeaders(),
      "X-Device-Id": deviceId 
    }
  });
  return r.data;
};

export const sendDocument = async (deviceId: string, file: Express.Multer.File, data: { phone: string; caption?: string; reply_message_id?: string; mentions?: string[]; mention_everyone?: boolean }) => {
  try {
    const formData = new FormData();
    formData.append("phone", data.phone);
    formData.append("file", file.buffer, { filename: file.originalname, contentType: file.mimetype });
    if (data.caption) formData.append("caption", data.caption);
    if (data.reply_message_id) formData.append("reply_message_id", data.reply_message_id);
    if (data.mentions) formData.append("mentions", typeof data.mentions === 'string' ? data.mentions : JSON.stringify(data.mentions));
    if (data.mention_everyone !== undefined) formData.append("mention_everyone", data.mention_everyone.toString());

    console.log(`[messagesService] Sending document to GoWA. phone: ${data.phone}, filename: ${file.originalname}`);

    const r = await client.post("/send/file", formData, {
      headers: { 
        ...formData.getHeaders(),
        "X-Device-Id": deviceId 
      }
    });
    return r.data;
  } catch (error: any) {
    console.error(`[messagesService] Error sending document:`, error.response?.data || error.message);
    throw error;
  }
};

export const sendAudio = async (deviceId: string, file: Express.Multer.File, data: { phone: string; ptt?: boolean; reply_message_id?: string }) => {
  const formData = new FormData();
  formData.append("phone", data.phone);
  formData.append("audio", file.buffer, { filename: file.originalname, contentType: file.mimetype });
  if (data.ptt !== undefined) formData.append("ptt", data.ptt.toString());
  if (data.reply_message_id) formData.append("reply_message_id", data.reply_message_id);

  const r = await client.post("/send/audio", formData, {
    headers: { 
      ...formData.getHeaders(),
      "X-Device-Id": deviceId 
    }
  });
  return r.data;
};

export const sendSticker = async (deviceId: string, file: Express.Multer.File, data: { phone: string; reply_message_id?: string }) => {
  const formData = new FormData();
  formData.append("phone", data.phone);
  formData.append("image", file.buffer, { filename: file.originalname, contentType: file.mimetype });
  if (data.reply_message_id) formData.append("reply_message_id", data.reply_message_id);

  const r = await client.post("/send/sticker", formData, {
    params: { device_id: deviceId },
    headers: { 
      ...formData.getHeaders(),
      "X-Device-Id": deviceId 
    }
  });
  return r.data;
};

export const sendLink = async (deviceId: string, data: { phone: string; url: string; caption?: string }) => {
  try {
    console.log(`[messagesService] Sending link to GoWA. phone: ${data.phone}, url: ${data.url}`);
    // Try /send/link first with standard parameters
    const r = await client.post("/send/link", data, {
      params: { device_id: deviceId },
      headers: { "X-Device-Id": deviceId }
    });
    return r.data;
  } catch (error: any) {
    console.error(`[messagesService] Error sending link to GoWA (/send/link):`, error.response?.data || error.message);
    
    // Fallback: Send as regular message
    console.log(`[messagesService] Falling back to /send/message for link`);
    try {
      const messageContent = data.caption 
        ? `${data.caption}\n\n${data.url}`
        : data.url;
        
      const r = await client.post("/send/message", {
        phone: data.phone,
        message: messageContent
      }, {
        params: { device_id: deviceId },
        headers: { "X-Device-Id": deviceId }
      });
      return r.data;
    } catch (fallbackError: any) {
      console.error(`[messagesService] Fallback also failed:`, fallbackError.response?.data || fallbackError.message);
      throw error; // Throw the original error if fallback also fails
    }
  }
};

export const sendPresence = async (deviceId: string, data: { presence: string }) => {
  const r = await client.post("/send/presence", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const sendChatPresence = async (deviceId: string, data: { phone: string; presence: string }) => {
  const r = await client.post("/send/chat-presence", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const revokeMessage = async (deviceId: string, data: { phone: string; message_id: string }) => {
  const r = await client.post("/message/revoke", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const deleteMessage = async (deviceId: string, data: { phone: string; message_id: string }) => {
  const r = await client.post("/message/delete", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const reactToMessage = async (deviceId: string, data: { phone: string; message_id: string; emoji: string }) => {
  const r = await client.post("/message/react", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const editMessage = async (deviceId: string, data: { phone: string; message_id: string; message: string }) => {
  const r = await client.post("/message/update", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const starMessage = async (deviceId: string, data: { phone: string; message_id: string; star: boolean }) => {
  const r = await client.post("/message/star", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const readMessage = async (deviceId: string, data: { phone: string; message_id: string }) => {
  const r = await client.post("/message/read", data, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId }
  });
  return r.data;
};

export const downloadMedia = async (deviceId: string, messageId: string) => {
  const r = await client.get(`/message/${messageId}/download`, {
    params: { device_id: deviceId },
    headers: { "X-Device-Id": deviceId },
    responseType: 'arraybuffer'
  });
  return r.data;
};
