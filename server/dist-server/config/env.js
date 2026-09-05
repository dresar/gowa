import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
// Parse APP_BASIC_AUTH format "username:password"
const parseBasicAuth = (authString) => {
    const [username, password] = authString.split(':');
    return { username: username || 'admin', password: password || 'password123' };
};
const basicAuth = parseBasicAuth(process.env.APP_BASIC_AUTH || 'admin:admin');
export const env = {
    PORT: parseInt(process.env.PORT || "3003", 10),
    HOST: process.env.HOST || "0.0.0.0",
    GOWA_BASE_URL: process.env.GOWA_BASE_URL || "http://192.168.18.50:3003",
    ADMIN_USERNAME: basicAuth.username,
    ADMIN_PASSWORD: basicAuth.password,
    WEBHOOK_SECRET: process.env.WHATSAPP_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || "secret",
};
