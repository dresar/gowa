import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import { 
  importContacts, 
  addSchedule, 
  getSchedules, 
  getLogs, 
  processSchedules 
} from "../services/broadcastService";
import { ok, badRequest, serverError } from "../utils/response";
import fs from "fs";
import path from "path";

const router = Router();
const upload = multer({ dest: "uploads/" });

// Import contacts and return list
router.post("/broadcast/import", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return badRequest(res, "No file uploaded");
    
    const contacts = importContacts(req.file.path);
    // Cleanup temp file
    fs.unlinkSync(req.file.path);
    
    ok(res, { status: true, results: contacts });
  } catch (e: any) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    serverError(res, e.message);
  }
});

// Create broadcast schedule
router.post("/broadcast/schedule", requireAuth, async (req, res) => {
  try {
    const { timestamp, content, recipients, metadata } = req.body;
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return badRequest(res, "Recipients are required");
    }
    if (!content || !content.message) {
      return badRequest(res, "Message content is required");
    }

    const schedule = addSchedule({
      timestamp: timestamp || Date.now(),
      content,
      recipients,
      metadata
    });

    ok(res, { status: true, data: schedule });
  } catch (e: any) {
    serverError(res, e.message);
  }
});

// Get all schedules
router.get("/broadcast/schedules", requireAuth, async (req, res) => {
  try {
    const schedules = getSchedules();
    ok(res, { status: true, results: schedules });
  } catch (e: any) {
    serverError(res, e.message);
  }
});

// Get logs
router.get("/broadcast/logs", requireAuth, async (req, res) => {
  try {
    const logs = getLogs();
    ok(res, { status: true, results: logs });
  } catch (e: any) {
    serverError(res, e.message);
  }
});

// Manual trigger process (optional, CLI also does this)
router.post("/broadcast/run", requireAuth, async (req, res) => {
  try {
    const { device_id } = req.body;
    if (!device_id) return badRequest(res, "Device ID is required");
    
    const count = await processSchedules(device_id);
    ok(res, { status: true, processed: count });
  } catch (e: any) {
    serverError(res, e.message);
  }
});

export default router;
