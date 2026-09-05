import { getSession } from "../services/authService";
export const requireDeviceScope = (req, res, next) => {
    const s = getSession();
    if (!s.deviceId) {
        res.status(400).json({ error: "device_not_selected" });
        return;
    }
    next();
};
