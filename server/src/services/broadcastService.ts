import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";
import { parse } from "csv-parse/sync";
import { readJSON, writeJSON } from "../utils/jsonFile";
import { storageDir } from "../config/storage";
import { BroadcastSchedule, BroadcastRecipient, BroadcastLog, BroadcastPayload } from "../models/broadcast";
import { encrypt, decrypt } from "../utils/crypto";
import { sendTextMessage } from "./messagesService";

const schedulesFile = path.join(storageDir, "broadcast_schedules.json");
const recipientsFile = path.join(storageDir, "broadcast_recipients.json");
const logsFile = path.join(storageDir, "broadcast_logs.json");

export const getSchedules = (): BroadcastSchedule[] => readJSON(schedulesFile, []);
export const getRecipients = (): BroadcastRecipient[] => readJSON(recipientsFile, []);
export const getLogs = (): BroadcastLog[] => readJSON(logsFile, []);

export const saveSchedules = (data: BroadcastSchedule[]) => writeJSON(schedulesFile, data);
export const saveRecipients = (data: BroadcastRecipient[]) => writeJSON(recipientsFile, data);
export const saveLogs = (data: BroadcastLog[]) => writeJSON(logsFile, data);

// Validasi nomor telepon format internasional
export const validatePhone = (phone: string): string | null => {
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
  if (!cleaned.startsWith("62") && cleaned.startsWith("8")) cleaned = "62" + cleaned;
  if (cleaned.length >= 10 && cleaned.length <= 15) return cleaned;
  return null;
};

// Import kontak dari file
export const importContacts = (filePath: string): { phone: string; name?: string }[] => {
  if (!fs.existsSync(filePath)) throw new Error("File not found: " + filePath);
  
  const stats = fs.statSync(filePath);
  if (stats.size > 10 * 1024 * 1024) {
    throw new Error("File size exceeds 10MB limit");
  }

  const ext = path.extname(filePath).toLowerCase();
  let contacts: any[] = [];

  if (ext === ".csv") {
    const content = fs.readFileSync(filePath, "utf8");
    contacts = parse(content, { columns: true, skip_empty_lines: true });
  } else if (ext === ".xls" || ext === ".xlsx") {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    contacts = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  } else {
    throw new Error("Unsupported file format. Use CSV, XLS, or XLSX.");
  }

  const validContacts = contacts
    .map((c: any) => ({
      phone: validatePhone(c.nomor_tujuan || c.phone || c.Number || ""),
      name: c.nama_kontak || c.name || c.Name || undefined,
    }))
    .filter((c) => c.phone !== null) as { phone: string; name?: string }[];

  console.log(`[Import] Berhasil mengimpor ${validContacts.length} kontak.`);
  return validContacts;
};

// Tambah Jadwal Baru
export const addSchedule = (payload: BroadcastPayload) => {
  const schedules = getSchedules();
  const scheduleId = Date.now().toString();

  const newSchedule: BroadcastSchedule = {
    id: scheduleId,
    schedule_json: encrypt(JSON.stringify({
      timestamp: payload.timestamp,
      content: payload.content,
      metadata: payload.metadata
    })),
    status: "pending",
    created_at: new Date().toISOString(),
  };

  schedules.push(newSchedule);
  saveSchedules(schedules);

  const recipients = getRecipients();
  payload.recipients.forEach((phone) => {
    recipients.push({
      id: Math.random().toString(36).substr(2, 9),
      schedule_id: scheduleId,
      phone_number: encrypt(phone),
      status: "pending",
    });
  });
  saveRecipients(recipients);

  addLog(scheduleId, "success", `Jadwal dibuat untuk ${payload.recipients.length} penerima.`);
  return newSchedule;
};

// Tambah Log
export const addLog = (scheduleId: string, status: "success" | "failed", message: string) => {
  const logs = getLogs();
  logs.push({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    schedule_id: scheduleId,
    timestamp: new Date().toISOString(),
    status,
    message,
  });
  saveLogs(logs);
  console.log(`[Log] [${status.toUpperCase()}] ${message}`);
};

// Proses Jadwal
export const processSchedules = async (deviceId: string) => {
  const schedules = getSchedules();
  const now = Date.now();
  let processedCount = 0;

  for (const schedule of schedules) {
    if (schedule.status !== "pending") continue;

    const decryptedJson = JSON.parse(decrypt(schedule.schedule_json)) as BroadcastPayload;
    if (decryptedJson.timestamp > now) continue;

    console.log(`[Broadcast] Memproses jadwal ${schedule.id}...`);
    schedule.status = "processing";
    saveSchedules(schedules);

    const allRecipients = getRecipients();
    const scheduleRecipients = allRecipients.filter(r => r.schedule_id === schedule.id);
    
    let successCount = 0;
    let failCount = 0;

    for (const recipient of scheduleRecipients) {
      if (recipient.status !== "pending") continue;

      const phone = decrypt(recipient.phone_number);
      try {
        const content = decryptedJson.content;
        if (content.type === 'text' && content.message) {
          await sendTextMessage(deviceId, { phone, message: content.message });
          recipient.status = "sent";
          successCount++;
        } else {
          throw new Error(`Unsupported content type or missing message: ${content.type}`);
        }
      } catch (error: any) {
        recipient.status = "failed";
        recipient.error = error.message;
        failCount++;
        console.error(`[Broadcast] Gagal mengirim ke ${phone}: ${error.message}`);
      }
    }

    // Update recipients in the main list
    const updatedRecipients = allRecipients.map(r => {
      const found = scheduleRecipients.find(sr => sr.id === r.id);
      return found ? found : r;
    });
    saveRecipients(updatedRecipients);

    schedule.status = successCount > 0 ? "completed" : "failed";
    saveSchedules(schedules);

    addLog(schedule.id, successCount > 0 ? "success" : "failed", 
      `Broadcast selesai. Berhasil: ${successCount}, Gagal: ${failCount}.`);
    processedCount++;
  }
  
  return processedCount;
};
