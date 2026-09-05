import { login, logout, getSession, setDevice } from "../services/authService";
import { ok, badRequest, noContent } from "../utils/response";
export const loginHandler = (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        badRequest(res, "missing_credentials");
        return;
    }
    const success = login(username, password);
    if (!success) {
        badRequest(res, "invalid_credentials");
        return;
    }
    ok(res, getSession());
};
export const logoutHandler = (req, res) => {
    logout();
    noContent(res);
};
export const sessionHandler = (req, res) => {
    ok(res, getSession());
};
export const setActiveDeviceHandler = (req, res) => {
    const { device_id } = req.body || {};
    if (!device_id) {
        badRequest(res, "missing_device_id");
        return;
    }
    const s = setDevice(device_id);
    ok(res, s);
};
