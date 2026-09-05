import { Request, Response } from "express";
import { getSettings, setSettings } from "../services/settingsService";
import { ok, badRequest } from "../utils/response";

export const getConnectionSettingsHandler = (_: Request, res: Response) => {
  ok(res, getSettings());
};

export const updateConnectionSettingsHandler = (req: Request, res: Response) => {
  const { base_url, username, password, device_id } = req.body || {};
  const data = setSettings({ base_url, username, password, device_id });
  ok(res, data);
};

