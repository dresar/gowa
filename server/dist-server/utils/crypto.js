import crypto from "crypto";
export const hmacSha256 = (secret, payload) => {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};
