import { Request, Response, NextFunction } from "express";
import { getSettings } from "../services/settingsService";
import { env } from "../config/env";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header("Authorization") || "";
  const match = header.match(/^Basic (.+)$/);
  if (!match) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const decoded = Buffer.from(match[1], "base64").toString("utf-8");
  const [u, p] = decoded.split(":");
  // Dashboard login should only use ADMIN_USERNAME and ADMIN_PASSWORD from .env
  const isValid = u === env.ADMIN_USERNAME && p === env.ADMIN_PASSWORD;
  
  if (!isValid) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
};
