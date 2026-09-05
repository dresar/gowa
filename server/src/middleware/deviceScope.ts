import { Request, Response, NextFunction } from "express";
import { getSession } from "../services/authService";

export const requireDeviceScope = (req: Request, res: Response, next: NextFunction) => {
  const s = getSession();
  if (!s.deviceId) {
    res.status(400).json({ error: "device_not_selected" });
    return;
  }
  next();
};

