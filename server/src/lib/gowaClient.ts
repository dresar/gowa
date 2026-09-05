import axios from "axios";
import { getSettings } from "../services/settingsService";

const client = axios.create({
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const { base_url, username, password, device_id } = getSettings();
  
  // Use settings credentials if available, otherwise fallback to admin credentials from env
  const authUser = username || process.env.ADMIN_USERNAME;
  const authPass = password || process.env.ADMIN_PASSWORD;
  
  const basic = Buffer.from(`${authUser}:${authPass}`).toString("base64");
  config.headers = config.headers || {};
  
  if (!config.headers.Authorization) {
    config.headers.Authorization = `Basic ${basic}`;
  }
  
  if (device_id && device_id !== "undefined" && !config.headers["X-Device-Id"]) {
    config.headers["X-Device-Id"] = device_id;
  }
  
  if (base_url) {
    config.baseURL = base_url.endsWith('/') ? base_url.slice(0, -1) : base_url;
  }
  
  const currentDeviceId = config.headers["X-Device-Id"];
  console.log(`[GoWA Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} ${currentDeviceId ? `(X-Device-Id: ${currentDeviceId})` : ''}`);
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data;
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const baseURL = error.config?.baseURL;

    console.error(`[GoWA Error] ${method} ${baseURL}${url} - Status: ${status}`);
    console.error(`[GoWA Error Detail]:`, errorData || error.message);
    if (errorData) {
        console.error(`[GoWA Full Data]:`, JSON.stringify(errorData, null, 2));
    }
    
    if (status === 401) {
      console.error(`[GoWA Error] Unauthorized! Please check your credentials in connection settings.`);
    }
    
    return Promise.reject(error);
  }
);

export default client;
