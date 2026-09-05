import { getSettings, setSettings } from "../services/settingsService";
import { ok, badRequest } from "../utils/response";
export const getConnectionSettingsHandler = (_, res) => {
    ok(res, getSettings());
};
export const updateConnectionSettingsHandler = (req, res) => {
    const { base_url, username, password, device_id } = req.body || {};
    if (!base_url || !username || !password) {
        badRequest(res, "missing_fields");
        return;
    }
    const data = setSettings({ base_url, username, password, device_id });
    ok(res, data);
};
