import { addRule, removeRule, getConfig } from "../services/autoReplyService";
import { readJSON, writeJSON } from "../utils/jsonFile";
import { webhookEventsFile } from "../config/storage";
import { ok, badRequest, noContent } from "../utils/response";
export const listAutoReplyHandler = (_, res) => {
    ok(res, getConfig());
};
export const addAutoReplyHandler = (req, res) => {
    const { contains, reply } = req.body || {};
    if (!contains || !reply) {
        badRequest(res, "missing_fields");
        return;
    }
    const rule = addRule(contains, reply);
    ok(res, rule);
};
export const deleteAutoReplyHandler = (req, res) => {
    const { id } = req.params;
    if (!id) {
        badRequest(res, "missing_id");
        return;
    }
    removeRule(id);
    noContent(res);
};
export const listWebhookEventsHandler = (_, res) => {
    const events = readJSON(webhookEventsFile, []);
    ok(res, events);
};
export const clearWebhookEventsHandler = (_, res) => {
    writeJSON(webhookEventsFile, []);
    noContent(res);
};
