import { getSettings } from "../services/settingsService";
import { env } from "../config/env";
export const requireAuth = (req, res, next) => {
    const header = req.header("Authorization") || "";
    const match = header.match(/^Basic (.+)$/);
    if (!match) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }
    const decoded = Buffer.from(match[1], "base64").toString("utf-8");
    const [u, p] = decoded.split(":");
    const { username, password } = getSettings();
    // Accept either settings credentials or env credentials
    const isValid = (u === username && p === password) || (u === env.ADMIN_USERNAME && p === env.ADMIN_PASSWORD);
    if (!isValid) {
        res.status(401).json({ error: "unauthorized" });
        return;
    }
    next();
};
