import { Request, Response } from "express";
import { addRule, removeRule, getConfig, updateSettings } from "../services/autoReplyService";
import { readJSON, writeJSON } from "../utils/jsonFile";
import { webhookEventsFile } from "../config/storage";
import { ok, badRequest, noContent } from "../utils/response";

export const listAutoReplyHandler = (_: Request, res: Response) => {
  ok(res, getConfig());
};

export const getAutoReplySettingsHandler = (_: Request, res: Response) => {
  const config = getConfig();
  ok(res, config.settings);
};

export const updateAutoReplySettingsHandler = (req: Request, res: Response) => {
  const settings = req.body || {};
  const updated = updateSettings(settings);
  ok(res, updated);
};

export const addAutoReplyHandler = (req: Request, res: Response) => {
  const { contains, reply } = req.body || {};
  if (!contains || !reply) {
    badRequest(res, "missing_fields");
    return;
  }
  const rule = addRule(contains, reply);
  ok(res, rule);
};

export const deleteAutoReplyHandler = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    badRequest(res, "missing_id");
    return;
  }
  removeRule(id);
  noContent(res);
};

export const listWebhookEventsHandler = (_: Request, res: Response) => {
  const events = readJSON<any[]>(webhookEventsFile, []);
  ok(res, events);
};

export const clearWebhookEventsHandler = (_: Request, res: Response) => {
  writeJSON(webhookEventsFile, []);
  noContent(res);
};
