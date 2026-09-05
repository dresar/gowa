import { handleWebhookEvent } from "../services/webhookService";
import { ok, badRequest, serverError } from "../utils/response";
import { env } from "../config/env";
import { hmacSha256 } from "../utils/crypto";
export const webhookHandler = async (req, res) => {
    try {
        const signature = req.header("X-Hmac-Sha256");
        const payload = JSON.stringify(req.body || {});
        if (signature) {
            const calc = hmacSha256(env.WEBHOOK_SECRET, payload);
            if (calc !== signature) {
                badRequest(res, "invalid_signature");
                return;
            }
        }
        await handleWebhookEvent(req.body || {});
        ok(res, { status: "ok" });
    }
    catch (e) {
        serverError(res, e.message || "error");
    }
};
